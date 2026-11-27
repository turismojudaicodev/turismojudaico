// Motor mínimo de las plantillas de mails (lib/mail-templates/*.js, generadas por scripts/mail-templates/build.py).
//   <!--IF expr--> ... <!--ENDIF-->   la sección queda solo si expr es verdadera con los flags de la reserva
//   {{nombre}}                         variable escapada; las que terminan en Html van tal cual (las arma la app)
// expr: flags combinados con & (y), | (o) y ! (no). & pesa más que |. Ej: "city:santos|city:saopaulo&cruise".
import { escapeHtml } from '../html'

export function evalCondition(expr, flags) {
  return String(expr)
    .split('|')
    .some((group) =>
      group.split('&').every((atom) => {
        const a = atom.trim()
        if (!a) throw new Error(`Condición vacía en "${expr}"`)
        return a.startsWith('!') ? !flags.has(a.slice(1)) : flags.has(a)
      })
    )
}

export function render(template, flags, vars) {
  const withSections = template.replace(/<!--IF ([^>]*?)-->([\s\S]*?)<!--ENDIF-->/g, (_, expr, body) => (evalCondition(expr, flags) ? body : ''))
  if (/<!--(IF|ENDIF)/.test(withSections)) throw new Error('Plantilla con IF/ENDIF sin cerrar')
  return withSections.replace(/\{\{(\w+)\}\}/g, (_, name) => {
    if (!(name in vars)) throw new Error(`Falta la variable {{${name}}} para la plantilla`)
    const value = vars[name] == null ? '' : String(vars[name])
    return name.endsWith('Html') ? value : escapeHtml(value)
  })
}
