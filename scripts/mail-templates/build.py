"""Arma las plantillas de mails de la app a partir de los mails reales del equipo (mails/*.eml).

Cada .eml se parte en bloques (párrafos, divs, listas y tablas) SIN tocar su HTML. spec.py dice, para cada
bloque, si va siempre, si va solo con una condición (destino, crucero, domingo...) o si se saca (notas internas).
De los bloques que quedan se sacan las marcas internas del equipo (rojo = dato a completar, resaltado amarillo
= título de sección), se reemplazan los datos a completar por variables {{nombre}} y las imágenes adjuntas por
archivos servidos desde /mail/.

Salida:
  lib/mail-templates/<id>.js     plantillas (módulo JS) con <!--IF cond--> ... <!--ENDIF--> y {{variables}}
  public/mail/<imagen>           imágenes que antes venían adjuntas en el mail

Uso (desde la raíz del proyecto):  python scripts/mail-templates/build.py
Requiere: pip install beautifulsoup4
"""
import email
import json
import os
import re
import sys
from email import policy

from bs4 import BeautifulSoup, NavigableString, Tag

sys.path.insert(0, os.path.dirname(__file__))
import spec  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
MAILS = os.path.join(ROOT, 'mails')
OUT = os.path.join(ROOT, 'lib', 'mail-templates')
IMG_OUT = os.path.join(ROOT, 'public', 'mail')

BLOCK = {'p', 'div', 'table', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'}
WHOLE = {'table', 'ul', 'ol'}
RED_STYLE = re.compile(r'(^|;|\s)color\s*:\s*(red|#ff0000|#f00|rgb\(\s*255\s*,\s*0\s*,\s*0\s*\))\s*;?', re.I)
YEL_STYLE = re.compile(r'background(-color)?\s*:\s*(yellow|#ffff00|#ff0|rgb\(\s*255\s*,\s*255\s*,\s*0\s*\))\s*;?', re.I)
RED_FONT = {'#ff0000', 'red', '#f00'}


# ---------------------------------------------------------------- lectura

def read_eml(name):
    path = os.path.join(MAILS, name)
    msg = email.message_from_binary_file(open(path, 'rb'), policy=policy.default)
    html, images = None, {}
    for part in msg.walk():
        if part.is_multipart():
            continue
        ct = part.get_content_type()
        if ct == 'text/html' and html is None:
            html = part.get_content()
        elif ct.startswith('image/') and part.get('Content-ID'):
            cid = part.get('Content-ID').strip('<>')
            images[cid] = (part.get_filename() or cid, part.get_payload(decode=True))
    if html is None:
        raise SystemExit(f'{name}: no tiene HTML')
    return html, images


def has_block_child(el):
    return any(isinstance(c, Tag) and c.name in BLOCK for c in el.descendants)


def leaf_blocks(root):
    out = []

    def walk(el):
        for c in list(el.children):
            if isinstance(c, Tag) and c.name in BLOCK:
                if c.name in WHOLE or not has_block_child(c):
                    out.append(c)
                else:
                    walk(c)
            elif isinstance(c, Tag) and has_block_child(c):
                walk(c)
            elif (isinstance(c, NavigableString) and c.strip()) or (isinstance(c, Tag) and c.name not in BLOCK):
                out.append(c)

    walk(root)
    return out


def text_of(el):
    return re.sub(r'\s+', ' ', el.get_text(' ', strip=True) if isinstance(el, Tag) else str(el)).strip()


# ---------------------------------------------------------------- transformaciones de un bloque

def strip_marks(el):
    """Saca el rojo y el resaltado amarillo (marcas internas del equipo) sin tocar el resto del formato."""
    if not isinstance(el, Tag):
        return
    for t in [el, *el.find_all(True)]:
        if t.name == 'font' and str(t.get('color', '')).lower() in RED_FONT:
            del t['color']
        style = t.get('style')
        if style:
            new = YEL_STYLE.sub('', RED_STYLE.sub(lambda m: m.group(1) if m.group(1) == ';' else '', style)).strip()
            if new:
                t['style'] = new
            else:
                del t['style']


def text_nodes(el):
    if isinstance(el, NavigableString):
        return [el]
    return [t for t in el.find_all(string=True) if t.strip()]


def set_text(el, new_text):
    """Reemplaza todo el texto del bloque por new_text, con el formato del primer texto."""
    nodes = text_nodes(el)
    if not nodes:
        raise ValueError('bloque sin texto')
    nodes[0].replace_with(new_text)
    for n in nodes[1:]:
        n.replace_with('')


def sub_text(el, pattern, repl):
    """Regex sobre cada nodo de texto. Devuelve cuántos reemplazos hizo."""
    count = 0
    for n in text_nodes(el):
        new, k = re.subn(pattern, repl, str(n))
        if k:
            n.replace_with(new)
            count += k
    return count


def sub_joined(el, pattern, repl):
    """Regex sobre el texto completo del bloque (para datos partidos en varios tags).
    El resultado queda en el primer nodo que toca el reemplazo; los demás nodos tocados se vacían."""
    nodes = text_nodes(el)
    full = ''.join(str(n) for n in nodes)
    m = re.search(pattern, full)
    if not m:
        return 0
    start, end = m.span()
    pos = 0
    first = True
    for n in nodes:
        s = str(n)
        a, b = pos, pos + len(s)
        pos = b
        if b <= start or a >= end:
            continue
        lo, hi = max(start, a) - a, min(end, b) - a
        if first:
            n.replace_with(s[:lo] + m.expand(repl) + s[hi:])
            first = False
        else:
            n.replace_with(s[hi:] if a < end <= b else s[:lo] if a < start else '')
    return 1


# ---------------------------------------------------------------- traducción

SKIP_TR = re.compile(r'^[\W\d_]*$|^(\{\{\w+\}\}[\W\d_]*)+$')


def tr_key(s):
    return re.sub(r'\s+', ' ', s).strip()


def load_translations(rel):
    data = json.load(open(os.path.join(os.path.dirname(__file__), rel), encoding='utf8'))
    return {tr_key(k): v for k, v in data.items() if not k.startswith('//')}


def translate(el, tr, missing, used):
    """Traduce cada nodo de texto por separado (así se conserva el formato: negritas, links, colores)."""
    for n in text_nodes(el):
        s = str(n)
        key = tr_key(s)
        if not key or SKIP_TR.match(key) or re.match(r'^(https?://|www\.)\S+$', key) or '@' in key and ' ' not in key:
            continue
        if key not in tr:
            missing.append(key)
            continue
        used.add(key)
        lead = s[:len(s) - len(s.lstrip())]
        trail = s[len(s.rstrip()):]
        n.replace_with(lead + tr[key] + trail)


# ---------------------------------------------------------------- armado

def build_one(tid, conf, image_names):
    html, images = read_eml(conf['src'])
    soup = BeautifulSoup(html, 'html.parser')
    blocks = leaf_blocks(soup)
    n = len(blocks)

    # Reglas: (bloque donde empieza la sección, condición). La sección sigue hasta la próxima regla.
    # Condición: 'ALWAYS', 'DROP' o una expresión de flags (ver lib/mails/render.js).
    rules = conf['rules']
    starts = [a for a, _ in rules]
    if starts != sorted(starts) or len(set(starts)) != len(starts) or starts[0] != 0:
        raise SystemExit(f'{tid}: las reglas tienen que empezar en 0 y estar en orden, sin repetir')
    if starts[-1] >= n:
        raise SystemExit(f'{tid}: la regla {starts[-1]} se pasa del total de bloques ({n})')
    cover = [None] * n
    for k, (a, cond) in enumerate(rules):
        b = rules[k + 1][0] - 1 if k + 1 < len(rules) else n - 1
        for i in range(a, b + 1):
            cover[i] = cond
    if conf.get('expect_blocks') and conf['expect_blocks'] != n:
        raise SystemExit(f'{tid}: el mail cambió ({n} bloques, se esperaban {conf["expect_blocks"]}): revisar spec.py')
    for i, needle in conf.get('anchors', {}).items():
        if needle.lower() not in text_of(blocks[i]).lower():
            raise SystemExit(f'{tid}: el bloque {i} ya no dice {needle!r} (dice {text_of(blocks[i])[:80]!r}): revisar spec.py')

    edits = conf.get('edits', {})
    tr = load_translations(conf['translations']) if conf.get('translations') else None
    missing, used = [], set()
    out = []
    current = None
    for i, el in enumerate(blocks):
        cond = cover[i]
        if cond == 'DROP':
            if i in edits:
                raise SystemExit(f'{tid}: el bloque {i} tiene cambios pero se saca')
            continue
        if isinstance(el, NavigableString):
            el = soup.new_tag('span') if not el.strip() else el
        strip_marks(el)
        for op in edits.get(i, []):
            kind = op[0]
            if kind == 'text':
                set_text(el, op[1])
            elif kind == 'sub':
                if not sub_text(el, op[1], op[2]):
                    raise SystemExit(f'{tid}: bloque {i}: no encontré {op[1]!r} en {text_of(el)[:120]!r}')
            elif kind == 'subj':
                if not sub_joined(el, op[1], op[2]):
                    raise SystemExit(f'{tid}: bloque {i}: no encontré {op[1]!r} en {text_of(el)[:120]!r}')
            elif kind == 'href':
                found = 0
                for a in el.find_all('a'):
                    if re.search(op[1], a.get('href', '')):
                        a['href'] = op[2]
                        found += 1
                if not found:
                    raise SystemExit(f'{tid}: bloque {i}: no hay link que coincida con {op[1]!r}')
            elif kind == 'append':
                el.append(BeautifulSoup(op[1], 'html.parser'))
            else:
                raise SystemExit(f'{tid}: cambio desconocido {kind}')
        if tr is not None:
            translate(el, tr, missing, used)
        # imágenes adjuntas -> /mail/<archivo>
        if isinstance(el, Tag):
            for img in ([el] if el.name == 'img' else []) + el.find_all('img'):
                src = img.get('src', '')
                if src.startswith('cid:'):
                    cid = src[4:]
                    if cid not in images:
                        raise SystemExit(f'{tid}: imagen {cid} no está adjunta')
                    fname = image_names(conf['src'], cid, *images[cid])
                    img['src'] = '{{baseUrl}}/mail/' + fname
        piece = str(el)
        if cond != current:
            if current not in (None, 'ALWAYS'):
                out.append('<!--ENDIF-->')
            if cond != 'ALWAYS':
                out.append(f'<!--IF {cond}-->')
            current = cond
        out.append(piece)
    if current not in (None, 'ALWAYS'):
        out.append('<!--ENDIF-->')

    if tr is not None:
        unused = [k for k in tr if k not in used]
        if missing or unused:
            dump = os.path.join(ROOT, 'scripts', 'mail-templates', 'faltan-' + tid + '.json')
            json.dump({'faltan': {k: '' for k in dict.fromkeys(missing)}, 'sobran': unused}, open(dump, 'w', encoding='utf8'),
                      ensure_ascii=False, indent=1)
            raise SystemExit(f'{tid}: {len(set(missing))} textos sin traducir y {len(unused)} traducciones que no se usan (ver {dump})')
        stale = os.path.join(ROOT, 'scripts', 'mail-templates', 'faltan-' + tid + '.json')
        if os.path.exists(stale):
            os.remove(stale)

    body = '\n'.join(out)
    # las llaves de la plantilla no pueden venir del mail original
    stray = re.findall(r'\{\{(?!(?:' + '|'.join(spec.VARS) + r')\}\})[^}]*\}\}', body)
    if stray:
        raise SystemExit(f'{tid}: variables desconocidas {stray[:5]}')
    return '<div dir="ltr">\n' + body + '\n</div>\n'


def main():
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(IMG_OUT, exist_ok=True)
    saved = {}

    def image_names(src, cid, filename, data):
        # mismo archivo (mismo contenido) -> mismo nombre; distinto contenido con igual nombre -> sufijo
        base = re.sub(r'[^a-z0-9.]+', '-', filename.lower()).strip('-')
        key = (base, len(data), data[:64])
        if key in saved:
            return saved[key]
        name = spec.IMAGE_NAMES.get((src, filename), base)
        root, ext = os.path.splitext(name)
        k = 1
        while name in saved.values():
            k += 1
            name = f'{root}-{k}{ext}'
        open(os.path.join(IMG_OUT, name), 'wb').write(data)
        saved[key] = name
        return name

    only = sys.argv[1:]
    report = {}
    for tid, conf in spec.TEMPLATES.items():
        if only and tid not in only:
            continue
        html = build_one(tid, conf, image_names)
        # Módulo JS (no .html suelto): así entra en el bundle de Next/Vercel sin depender de leer archivos.
        js = ('// GENERADO por scripts/mail-templates/build.py desde mails/' + conf['src'] + '. No editar a mano.\n'
              'export default ' + json.dumps(html, ensure_ascii=False) + '\n')
        open(os.path.join(OUT, tid + '.js'), 'w', encoding='utf8', newline='\n').write(js)
        report[tid] = len(html)
    print(json.dumps({'plantillas': report, 'imagenes': sorted(set(saved.values()))}, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
