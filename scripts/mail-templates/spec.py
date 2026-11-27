"""Qué bloques de cada mail real van en cada plantilla, y con qué condición.

Reglas: (bloque donde empieza la sección, condición). La sección sigue hasta la próxima regla.
Los números de bloque salen de: python scripts/mail-templates/blocks.py mails/<archivo>.eml
Condiciones (las calcula lib/mails/flags.js):
  city:<ba|rio|santiago|lima|panama|recife|santos|saopaulo|montevideo|puntadeleste|bogota|cartagena|puertorico|mexico>
  policy:<GUIDE_VETTED|EXTERNAL_FORM|NONE>   cruise   port:<amador|colon|santos|san_antonio|callao|...>
  sunday   high (dic/ene/feb)   far (faltan más de 60 días)   kosher   luggage   returning
  pax:1  pax:2  pax:3  pax:4+  pax:3-5  pax:6-8  pax:9+
  Cobro (los arma lib/mails/index.js): plan:cash  plan:online  plan:full  payfull (ya hay que pagar todo)  walking
  start  pickup  dropoff (hay hora de inicio / lugar de búsqueda / de regreso cargados)
  Confirmación: guide:<nombre-apellido> (guía elegido en el panel)  paid  balance  amia
  Se combinan con & (y), | (o) y ! (no). & pesa más que |.
Cambios por bloque (edits):
  ('text', nuevo)           reemplaza todo el texto del bloque (conserva el formato del primer texto)
  ('sub', regex, repl)      regex sobre cada texto del bloque
  ('subj', regex, repl)     regex sobre el texto completo (para datos partidos en varios tags)
  ('href', regex, url)      cambia el link
  ('append', html)          agrega HTML al final del bloque
anchors: textos que tienen que seguir estando en esos bloques; si el mail cambia, el armado frena.
"""

# Variables que pueden aparecer en las plantillas. Las que terminan en Html van sin escapar (las arma la app).
VARS = ['baseUrl', 'firstName', 'city', 'tourDateLong', 'phone', 'shipQuoted', 'securityLink', 'tripFormHtml',
        # cobro (rta 2)
        'paxText', 'paxShort', 'totalUsd', 'depositUsd', 'balanceUsd', 'dueUsd', 'payLink', 'serviceName', 'startTime', 'pickup', 'dropoff',
        # confirmación (rta 3)
        'paidUsd', 'balanceNote', 'guideName', 'guidePhone', 'vehicle', 'pickupKind']

# Nombres de las imágenes adjuntas al guardarlas en public/mail/
IMAGE_NAMES = {
    ('ENGLISH - rta 1 (1).eml', 'Logos apoyo TJ.jpg'): 'logos-organizaciones.jpg',
    ('ENGLISH - rta 1 (1).eml', 'mapa-latinoamerica-2024.jpg'): 'mapa-latinoamerica.jpg',
    ('ENGLISH - rta 1 (1).eml', 'image.png'): 'dsi-formulario-en.png',
    ('ENGLISH - rta 1 (1).eml', 'DSI.jpg'): 'dsi-qr.jpg',
    ('ENGLISH - rta 1 (1).eml', 'Pao DSI approved.png'): 'dsi-aprobado.png',
}

PHONE = ('subj', r'\+?\d[\d\s()-]{6,}\d', '{{phone}}')
NO_NOTE = ('subj', r'\s*\(\s*ojo que si dicen.*$', '')

TEMPLATES = {
    # ------------------------------------------------------------------ Firma (va al final de todos los mails)
    'signature': {
        'src': 'original_msg.eml',
        'expect_blocks': 9,
        'anchors': {3: 'Info', 4: 'info@turismojudaico.com', 5: 'WhatsApp'},
        'rules': [(0, 'ALWAYS')],
    },
    # ------------------------------------------------------------------ Propuesta (rta 1) en inglés
    'proposal.en': {
        'src': 'ENGLISH - rta 1 (1).eml',
        'expect_blocks': 628,
        'anchors': {0: 'Dear', 3: 'Happy to hear from you again', 7: 'Thank you for getting in contact', 34: 'different options in Buenos Aires',
                    101: 'Jewish Tour in Rio de Janeiro', 216: 'PANAMÁ', 289: 'Jewish tour in Santiago', 417: 'Jewish Tour in Lima',
                    513: 'Our Jewish Tours include', 548: 'Reservation Requirements', 558: 'Reservation Requirements',
                    569: 'PANAMA SECURITY PROTOCOLS', 600: 'To validate our services', 615: 'Melina'},
        'rules': [
            (0, 'ALWAYS'),                                  # Dear ...
            (2, 'DROP'),                                    # nota: clientes anteriores
            (3, 'returning'),                               # Happy to hear from you again + 10%
            (6, 'DROP'),                                    # nota: pasajeros nuevos
            (7, '!returning'),                              # presentación, logos, video
            (21, 'DROP'),
            (22, '!returning&!city:panama'),                # official tour
            (24, 'DROP'),
            (25, '!returning&!city:panama'),                # disponibilidad para la fecha
            (27, '!returning&!city:panama&high'),           # alta demanda
            (29, 'DROP'),
            (31, 'ALWAYS'),                                 # Here is all the information about the Jewish Tour in ...
            (33, 'DROP'),
            (34, 'city:ba'),
            (88, 'DROP'),
            (89, 'city:ba&sunday'),
            (100, 'DROP'),
            (101, 'city:rio'),
            (146, 'DROP'),
            (148, 'city:santos&cruise|city:saopaulo&cruise'),
            (156, 'DROP'),
            (157, 'city:santos|city:saopaulo&cruise'),
            (173, 'DROP'),                                  # nota: dejar solo el precio
            (174, 'city:santos|city:saopaulo&cruise'),
            (183, 'DROP'),
            (184, 'city:saopaulo'),
            (197, 'DROP'),                                  # "esta no ofrecerla por ahora"
            (201, 'city:saopaulo'),
            (205, 'DROP'),
            (206, 'city:recife'),
            (215, 'DROP'),
            (216, 'city:panama'),
            (222, 'city:panama&high'),
            (224, 'city:panama'),
            (235, 'DROP'),                                  # "TOURS PRIVADOS:"
            (236, 'city:panama'),
            (243, 'DROP'),
            (244, 'city:panama&sunday'),
            (257, 'DROP'),                                  # sinagoga conservadora: solo si la piden
            (262, 'city:panama&port:amador'),
            (265, 'DROP'),
            (266, 'city:panama&port:colon'),
            (269, 'DROP'),
            (270, 'city:panama'),
            (284, 'city:panama&!cruise'),                   # 6. hotel
            (285, 'city:panama'),
            (288, 'DROP'),
            (289, 'city:santiago'),
            (297, 'DROP'),
            (298, 'city:santiago&pax:1'),
            (301, 'DROP'),
            (303, 'city:santiago&pax:2'),
            (304, 'DROP'),                                  # precios viejos (antes de nov 2026)
            (309, 'city:santiago&pax:2'),
            (313, 'DROP'),                                  # precios viejos
            (319, 'city:santiago&pax:3'),
            (324, 'city:santiago&pax:4+'),
            (330, 'DROP'),
            (331, 'city:santiago&port:san_antonio'),
            (354, 'city:santiago'),
            (358, 'DROP'),
            (359, 'city:montevideo|city:puntadeleste'),
            (393, 'DROP'),
            (394, 'city:montevideo|city:puntadeleste'),
            (416, 'DROP'),
            (417, 'city:lima'),
            (444, 'city:lima&!kosher'),
            (445, 'DROP'),
            (447, 'city:lima&kosher'),
            (459, 'DROP'),
            (460, 'city:bogota'),
            (478, 'city:cartagena'),
            (494, 'DROP'),
            (495, 'city:puertorico'),
            (512, 'DROP'),
            (513, '!city:panama'),                          # Our Jewish Tours include (todas menos Panamá)
            (523, 'DROP'),                                  # calendario de crucero por ciudad (a mano)
            (534, 'cruise'),
            (536, 'DROP'),                                  # ciudades y fechas de ejemplo
            (537, 'cruise'),
            (540, 'DROP'),
            (541, 'far&!city:panama'),
            (544, 'ALWAYS'),                                # ¿otras ciudades?
            (547, 'DROP'),
            (548, 'policy:GUIDE_VETTED'),
            (555, 'DROP'),                                  # pedidos con menos de una semana: van por el mail TARDE
            (558, 'policy:NONE'),
            (565, 'policy:NONE&!cruise'),                   # 6. hotel
            (566, 'policy:NONE'),
            (568, 'DROP'),
            (569, 'city:panama'),                           # protocolo DSI
            (599, 'DROP'),
            (600, 'ALWAYS'),                                # cierre
        ],
        'edits': {
            0: [('text', 'Dear {{firstName}},')],
            25: [('subj', r'requested day:.*$', 'requested day: {{tourDateLong}}.')],
            31: [('subj', r'xxxx\s*\(COLOCAR LA CIUDAD QUE PIDEN\)', '{{city}}')],
            89: [('subj', r'^xxxx', '{{tourDateLong}}')],
            220: [('subj', r'available for .*$', 'available for {{tourDateLong}}.')],
            279: [PHONE],
            284: [NO_NOTE],
            324: [('subj', r'\s*-\s*siguen igual.*$', '')],
            425: [('text', 'Prices for the 4 hours tour:')],
            434: [('text', 'Prices for the 3 hours tour:')],
            534: [('subj', r'Will you be traveling on a cruise ship\?\s*/\s*', ''),
                  ('subj', r'cruise ship\s*"\s*Princess Emerald\s*"\s*,', 'cruise ship{{shipQuoted}},')],
            542: [('subj', r'sign payment of USD 50\.-', 'sign payment of 50%'), ('subj', r'ten days before', '15 days before')],
            544: [('subj', r'^Rio de Janeiro', '{{city}}')],
            551: [('href', r'forms\.gle', '{{securityLink}}')],
            560: [PHONE],
            565: [NO_NOTE],
            566: [('append', '{{tripFormHtml}}')],
            593: [('append', '<br><br>{{tripFormHtml}}')],
        },
    },
}

# ------------------------------------------------------------------ Propuesta (rta 1) en español
# Las rta en español de mails/ están viejas (precios, seña de USD 100, Payoneer): la versión en español sale de la
# inglesa, con los mismos bloques y reglas, traduciendo cada texto (es/proposal.json, para revisar por el equipo).
TEMPLATES['proposal.es'] = {**TEMPLATES['proposal.en'], 'translations': 'es/proposal.json'}

# ------------------------------------------------------------------ Cobro (rta 2): detalles del servicio, precio, forma de pago
TEMPLATES['payment.en'] = {
    'src': 'ENGLISH - rta 2.eml',
    'expect_blocks': 163,
    'anchors': {0: 'Hi', 9: 'NEXT STEPS', 23: 'Service to', 35: 'Walking Jewish Tour in Buenos Aires', 44: 'how many bags',
                47: 'donations in Jewish sites', 50: 'AMIA', 71: 'final price', 87: 'Cost for', 94: 'final price',
                101: '15 days before', 104: 'Cancellation Policy', 109: 'As soon as we get the payment', 124: 'Thank you'},
    'rules': [
        (0, 'ALWAYS'),                                   # Hi / gracias
        (5, 'DROP'),                                     # kosher (ya se pregunta en el formulario), próximos pasos, DSI (van en la propuesta)
        (23, '!walking'),                                # Service to confirm / Date
        (25, '!walking&start'),
        (26, '!walking&pickup'),
        (27, 'DROP'),                                    # hora de fin (no la tenemos)
        (28, '!walking&dropoff'),
        (29, '!walking&city:panama'),                    # termina en el Super Kosher
        (30, 'DROP'),                                    # costo (va en la parte de pago)
        (33, 'DROP'),
        (35, 'city:ba&walking'),                         # walking tour en Buenos Aires
        (42, 'DROP'),
        (44, 'luggage'),
        (45, 'DROP'),
        (47, 'city:santiago'),
        (48, 'DROP'),
        (50, 'city:ba'),
        (52, 'DROP'),                                    # datos que faltan / DSI: van en la propuesta
        (71, 'plan:cash'),                               # seña + saldo en efectivo al guía
        (84, 'DROP'),
        (87, 'plan:full|payfull'),                       # todo por adelantado (Panamá, o faltan menos de 15 días)
        (91, 'DROP'),
        (94, 'plan:online&!payfull'),                    # seña + saldo online 15 días antes
        (99, 'DROP'),                                    # nota: fechas lejanas
        (101, 'plan:online&!payfull'),
        (102, 'DROP'),
        (104, 'plan:online|plan:full'),                  # política de cancelación (pago online)
        (108, 'DROP'),
        (109, 'ALWAYS'),                                 # apenas recibamos el pago...
        (110, 'DROP'),                                   # tours locales de Panamá (solo si los piden)
        (123, 'ALWAYS'),
        (125, 'DROP'),                                   # email 2B (transferencia) y la firma vieja
    ],
    'edits': {
        0: [('text', 'Hi {{firstName}},')],
        23: [('subj', r'HALF / FULL DAY\s*Jewish City Tour in Panama', ' {{serviceName}}')],
        24: [('subj', r'Tuesday 12\s*January, 2024', '{{tourDateLong}}')],
        25: [('subj', r'9\s*\.00 am', '{{startTime}}')],
        26: [('subj', r'Hotel\s*$', '{{pickup}}')],
        28: [('subj', r'Hotel / Cruise Dock', '{{dropoff}}')],
        36: [('subj', r'x{4,}', '{{tourDateLong}}')],
        71: [('subj', r'\d+ participants', '{{paxText}}'), ('subj', r'USD\s*300', 'USD {{totalUsd}}')],
        73: [('subj', r'USD\s*100', 'USD {{depositUsd}}')],
        74: [('href', r'stripe\.com', '{{payLink}}')],
        77: [('subj', r'USD 200', 'USD {{balanceUsd}}')],
        87: [('subj', r'2 pax', '{{paxShort}}'), ('subj', r'USD 180', 'USD {{totalUsd}}')],
        88: [('subj', r'USD 180', 'USD {{dueUsd}}')],
        89: [('href', r'stripe\.com', '{{payLink}}')],
        94: [('subj', r'\d+ participants', '{{paxText}}'), ('subj', r'USD\s*300', 'USD {{totalUsd}}')],
        96: [('subj', r'USD\s*100', 'USD {{depositUsd}}')],
        97: [('href', r'stripe\.com', '{{payLink}}')],
        101: [('subj', r'\(USD 200\.-\)', '(USD {{balanceUsd}}.-)')],
    },
}
# El mail de cobro no tiene firma con nombre: se agrega la de Melina al final.
TEMPLATES['payment.en']['edits'][124] = [('append', '<br>Melina<br>on behalf of Judaic Tourism Team')]
TEMPLATES['payment.es'] = {**TEMPLATES['payment.en'], 'translations': 'es/payment.json'}

# ------------------------------------------------------------------ Confirmación (rta 3): detalles de la reserva y datos del guía
# Los párrafos de cada guía van con guide:<nombre-apellido> (el guía que se elige en el panel, sin acentos).
CITY_VIDEOS = ('city:panama|city:ba|city:santiago|city:rio|city:santos|city:saopaulo|city:lima|city:costarica'
               '|city:recife|city:montevideo|city:curazao')
NO_LABEL = ('subj', r'^\s*PANAMA\s*', '')
TEMPLATES['confirmation.en'] = {
    'src': 'ENGLISH - rta 3.eml',
    'expect_blocks': 126,
    'anchors': {2: 'confirmation of your payment', 7: 'Here are all your details', 21: 'Remains to be paid', 25: 'original passports',
                33: 'Ariela Bodner', 38: 'Cardoso', 48: 'Edith Vidal', 53: 'Mijael Aviram', 58: 'Patricia Abadi', 61: 'Isaac Lalo',
                69: 'Raquel Schneider', 72: 'Benaim', 79: 'confirmed a few weeks before', 83: 'Marcy Shub', 87: 'WHATSAPP',
                106: 'cancel the tour', 117: 'Judaic Tourism Team'},
    'rules': [
        (0, 'ALWAYS'),
        (9, 'DROP'),                                     # duración (no la tenemos)
        (10, 'start'),
        (11, 'city:panama'),                             # el guía confirma la hora de búsqueda el día anterior
        (12, 'pickup'),
        (13, 'city:panama'),                             # termina en el Super Kosher
        (14, 'DROP'),                                    # incluye "Transportation" (lo elige el equipo)
        (19, 'ALWAYS'),                                  # pasajeros
        (20, 'paid'),
        (21, 'balance'),
        (22, 'DROP'),
        (25, '!city:panama'),                            # llevar los pasaportes
        (26, 'DROP'),
        (27, 'city:santiago'),                           # donaciones
        (28, 'DROP'),
        (29, 'city:ba&amia'),                            # entrada a la AMIA
        (30, 'DROP'),
        (33, 'guide:ariela-bodner'),
        (35, 'city:ba'),                                 # coordinadora en Buenos Aires
        (36, 'DROP'),
        (38, 'guide:alberto-jose-cardoso'),
        (40, 'city:rio'),
        (41, 'DROP'),
        (42, 'city:rio&kosher'),
        (46, 'DROP'),
        (48, 'guide:edith-vidal|guide:oscar-furman'),
        (49, 'DROP'),
        (50, 'city:santiago'),
        (51, 'DROP'),
        (53, 'guide:mijael-aviram'),
        (55, 'DROP'),
        (58, 'guide:patricia-abadi'),
        (60, 'DROP'),
        (61, 'guide:isaac-lalo'),
        (63, 'city:panama'),
        (64, 'DROP'),
        (65, 'city:panama'),                             # restaurantes kosher en Panamá
        (66, 'DROP'),
        (69, 'guide:raquel-schneider'),
        (71, 'DROP'),
        (72, 'guide:jose-benaim'),
        (74, 'DROP'),
        (75, 'city:lima'),
        (76, 'DROP'),
        (79, 'city:montevideo|city:puntadeleste'),       # el guía se confirma unas semanas antes
        (81, 'DROP'),
        (83, 'guide:marcy-shub'),
        (85, 'DROP'),
        (87, 'ALWAYS'),                                  # contactar al guía el día anterior
        (91, CITY_VIDEOS),                               # video de la ciudad
        (92, 'city:panama'), (93, 'city:ba'), (94, 'city:santiago'), (95, 'city:rio'), (96, 'city:santos'),
        (97, 'city:saopaulo'), (98, 'city:lima'), (99, 'city:costarica'), (100, 'city:recife'), (101, 'city:montevideo'),
        (102, 'city:curazao'),
        (103, 'DROP'),
        (106, 'plan:cash'),                              # si cancela, avisar (parte del pago es en efectivo)
        (107, 'ALWAYS'),                                 # pedido de reseña y cierre
        (118, 'DROP'),
    ],
    'edits': {
        0: [('text', 'Hi {{firstName}},')],
        7: [('subj', r'Jewish City tour in\s*BUENOS\s*AIRES', '{{serviceName}}')],
        8: [('subj', r'Tuesday 29 september 2016', '{{tourDateLong}}')],
        10: [('subj', r'From 10\.00am to 13\.00hs', '{{startTime}}')],
        11: [NO_LABEL],
        12: [('subj', r'Claridge Hotel.*$', '{{pickup}}')],
        13: [NO_LABEL],
        19: [('subj', r'2 pax\.', '{{paxShort}}.')],
        20: [('subj', r'USD 100\.- sign payment already paid\.', 'USD {{paidUsd}}.- already paid.')],
        21: [('subj', r'USD 360\.-.*guide\.', 'USD {{balanceUsd}}.- {{balanceNote}}')],
        27: [('subj', r'^\s*SANTIAGO\s*:\s*', '')],
        29: [('subj', r'^\s*BUENOS AIRES\s*:\s*', '')],
        34: [('subj', r'He/She will pick you with a car/Mini-van from the hotel / Cruise ship terminal\.',
              'The guide will pick you up with a {{vehicle}} from the {{pickupKind}}.')],
        38: [('subj', r'Albertro', 'Alberto')],
        39: [('subj', r'She/He will pick you with a private car/Mini-van from the hotel/Cruise ship terminal\.',
              'The guide will pick you up with a private {{vehicle}} from the {{pickupKind}}.')],
        48: [('subj', r'Edith Vidal.*?Oscar Furman', '{{guideName}} ({{guidePhone}})'),
             ('subj', r'He/She will pick you', 'The guide will pick you up')],
        117: [('text', 'Melina, on behalf of Judaic Tourism Team')],
    },
}
TEMPLATES['confirmation.es'] = {**TEMPLATES['confirmation.en'], 'translations': 'es/confirmation.json'}

# ------------------------------------------------------------------ TARDE: la reserva llegó con menos de una semana (queda como borrador)
TEMPLATES['late.en'] = {
    'src': 'TARDE.eml',
    'expect_blocks': 60,
    'anchors': {0: 'Dear', 3: 'very close to the date', 10: 'CARTAGENA', 15: 'introduce ourselves', 33: 'Melina', 38: 'Español'},
    'rules': [
        (0, 'ALWAYS'),
        (10, 'DROP'),                                    # variante Cartagena (guía no disponible)
        (13, 'ALWAYS'),
        (35, 'DROP'),                                    # versión en español y la firma vieja
    ],
    'edits': {0: [('text', 'Dear {{firstName}},')]},
}
TEMPLATES['late.es'] = {
    'src': 'TARDE.eml',
    'expect_blocks': 60,
    'anchors': {38: 'Español', 40: 'Estimado', 47: 'Lucas', 48: 'en nombre del Equipo'},
    'rules': [
        (0, 'DROP'),                                     # versión en inglés
        (40, 'ALWAYS'),
        (49, 'DROP'),                                    # la firma vieja
    ],
    'edits': {
        40: [('subj', r'Estimado\s*x+\s*', 'Hola {{firstName}}, ')],
        47: [('text', 'Melina')],
    },
}
