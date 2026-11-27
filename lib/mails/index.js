// Mails al cliente armados con las plantillas reales del equipo (lib/mail-templates, generadas desde mails/*.eml).
// Cada función devuelve { subject, html, review }: review es null si el mail puede salir solo,
// o un texto que explica por qué conviene revisarlo antes (queda como borrador).
import { render } from './render'
import { bookingFlags, cityOf, longDate } from './flags'
import signature from '../mail-templates/signature'
import proposalEn from '../mail-templates/proposal.en'
import proposalEs from '../mail-templates/proposal.es'
import paymentEn from '../mail-templates/payment.en'
import paymentEs from '../mail-templates/payment.es'
import confirmationEn from '../mail-templates/confirmation.en'
import confirmationEs from '../mail-templates/confirmation.es'
import lateEn from '../mail-templates/late.en'
import lateEs from '../mail-templates/late.es'

const baseUrl = () => process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

const TEMPLATES = {
  proposal: { en: proposalEn, es: proposalEs },
  payment: { en: paymentEn, es: paymentEs },
  confirmation: { en: confirmationEn, es: confirmationEs },
  late: { en: lateEn, es: lateEs },
}

// Guías que tienen su párrafo en la confirmación (rta 3), por guideKey(nombre).
export const TEMPLATE_GUIDES = ['ariela-bodner', 'alberto-jose-cardoso', 'edith-vidal', 'oscar-furman', 'mijael-aviram', 'patricia-abadi',
  'isaac-lalo', 'raquel-schneider', 'jose-benaim', 'marcy-shub']
// Ciudades donde la confirmación sale sin guía (se confirma unas semanas antes).
const NO_GUIDE_CITIES = ['montevideo', 'puntadeleste']

// Ciudades que tienen su sección en la propuesta (rta 1). Para las demás, la propuesta queda como borrador.
const PROPOSAL_CITIES = ['ba', 'rio', 'santos', 'saopaulo', 'recife', 'panama', 'santiago', 'montevideo', 'puntadeleste', 'lima', 'bogota', 'cartagena', 'puertorico']

const FONT = 'trebuchet ms, sans-serif'

/** Botón al formulario de la app (datos del viaje / seguridad), con la letra de las plantillas. */
export function tripFormHtml(link, language = 'en') {
  const text = language === 'es' ? 'Por favor, complete los datos del viaje en este link:' : 'Please complete your trip details at this link:'
  const button = language === 'es' ? 'Completar los datos del viaje' : 'Complete my trip details'
  return `<font face="${FONT}">${text}</font><br><br>` +
    `<a href="${link}" style="background-color:#2980b9;color:#ffffff;padding:10px 18px;text-decoration:none;border-radius:5px;font-weight:bold;font-family:${FONT}">${button}</a><br><br>`
}

const firstName = (name) => String(name || '').trim().split(/\s+/)[0] || ''

function commonVars(booking, language) {
  const securityLink = `${baseUrl()}/security/${booking.booking_uuid}`
  const answers = typeof booking.booking_answers_json === 'string' ? safeJson(booking.booking_answers_json) : booking.booking_answers_json
  const ship = answers?.cruise?.ship
  return {
    baseUrl: baseUrl(),
    firstName: firstName(booking.client_name),
    city: cityOf(booking.destination_name, language).name,
    tourDateLong: longDate(booking.tour_date, language),
    phone: String(booking.client_phone || '').trim() || '-',
    shipQuoted: ship ? ` "${ship}"` : '',
    securityLink,
    tripFormHtml: tripFormHtml(securityLink, language),
  }
}

function safeJson(s) {
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}

// Asunto según la etapa, como los manda el equipo:
//   primer mail del hilo  -> "Jewish Tour Chile Dec 21"
//   respuestas en el hilo -> "Re: Jewish Tour Chile Dec 21" (propuesta después de "Recibimos su consulta", cobro)
//   confirmación          -> "Confirmation: Jewish Tour Buenos Aires Dec 3" (hilo nuevo)
const SUBJECT_PLACE = { santiago: { en: 'Chile', es: 'Chile' } }
export function baseSubject(booking, lang = 'en') {
  const city = cityOf(booking.destination_name, lang)
  const place = SUBJECT_PLACE[city.slug]?.[lang] || city.name
  const iso = String(booking.tour_date instanceof Date ? booking.tour_date.toISOString() : booking.tour_date || '').slice(0, 10)
  let date = ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const d = new Date(`${iso}T12:00:00Z`)
    date = lang === 'es'
      ? `${d.getUTCDate()} ${d.toLocaleDateString('es-AR', { month: 'short', timeZone: 'UTC' }).replace('.', '')}`
      : `${d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })} ${d.getUTCDate()}`
  }
  return [lang === 'es' ? 'Tour Judaico' : 'Jewish Tour', place, date].filter(Boolean).join(' ')
}
export function stageSubject(stage, booking, lang = 'en') {
  const base = baseSubject(booking, lang)
  if (stage === 'reply') return `Re: ${base}`
  if (stage === 'confirmation') return `${lang === 'es' ? 'Confirmación' : 'Confirmation'}: ${base}`
  return base
}

const withSignature = (html) => html + '\n' + render(signature, new Set(), { baseUrl: baseUrl() })

/** Idioma de la plantilla: el de la reserva si existe esa versión; si no, inglés. */
function pick(kind, booking) {
  const lang = booking.client_language === 'es' ? 'es' : 'en'
  const tpl = TEMPLATES[kind][lang] || TEMPLATES[kind].en
  return { tpl, lang: TEMPLATES[kind][lang] ? lang : 'en' }
}

/** Propuesta (rta 1): presentación, info y precios de la ciudad, requisitos según la política de seguridad. */
export function proposalMail(booking, { returning = false, today, reply = false } = {}) {
  const { tpl, lang } = pick('proposal', booking)
  const flags = bookingFlags(booking, { returning, today })
  const vars = commonVars(booking, lang)
  const city = cityOf(booking.destination_name, lang)
  const review = PROPOSAL_CITIES.includes(city.slug)
    ? null
    : `La plantilla de propuesta no tiene la sección de "${city.name}": completá la info y los precios antes de mandarla.`
  return {
    subject: stageSubject(reply ? 'reply' : 'first', booking, lang),
    html: withSignature(render(tpl, flags, vars)),
    review,
    language: lang,
  }
}

const norm = (v) => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/** "José Benaim" -> "jose-benaim" (la clave de su párrafo en la plantilla). */
export const guideKey = (name) => norm(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** 175 -> "175", 232.5 -> "232.50" */
export const usd = (n) => {
  const v = Math.round(Number(n || 0) * 100) / 100
  return Number.isInteger(v) ? String(v) : v.toFixed(2)
}

const paxCount = (b) => Number(b.pax_adults || 0) + Number(b.pax_children || 0) || 1
const clean = (v) => String(v || '').trim()
const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

function serviceName(booking, lang) {
  const city = cityOf(booking.destination_name, lang).name
  const option = clean(booking.tour_option)
  const base = lang === 'es' ? `Tour Judaico en ${city}` : `Jewish Tour in ${city}`
  return option ? `${base} - ${option}` : base
}

function parseAnswersSafe(booking) {
  return typeof booking.booking_answers_json === 'string' ? safeJson(booking.booking_answers_json) : booking.booking_answers_json || null
}

/** Flags y variables de cobro/confirmación que salen de la reserva y del estado de cuenta. */
function serviceFlagsVars(booking, summary, lang, flags) {
  const answers = parseAnswersSafe(booking)
  const cruise = !!answers?.cruise
  const pax = paxCount(booking)
  if (summary) {
    flags.add(summary.plan.upfront === 'FULL' ? 'plan:full' : summary.plan.balance === 'CASH' ? 'plan:cash' : 'plan:online')
    if (summary.fullRequired) flags.add('payfull')
    if (summary.paid > 0) flags.add('paid')
    if (summary.balance > 0) flags.add('balance')
  }
  if (/walk|caminando/i.test(clean(booking.tour_option))) flags.add('walking')
  if (clean(booking.start_time)) flags.add('start')
  if (clean(booking.pick_up_hotel) || cruise) flags.add('pickup')
  if (clean(booking.drop_off_hotel)) flags.add('dropoff')
  if (Number(booking.extra_amia)) flags.add('amia')
  const es = lang === 'es'
  return {
    paxText: es ? `${pax} participante${pax === 1 ? '' : 's'}` : `${pax} participant${pax === 1 ? '' : 's'}`,
    paxShort: `${pax} pax`,
    serviceName: serviceName(booking, lang),
    startTime: clean(booking.start_time),
    pickup: clean(booking.pick_up_hotel) || (cruise ? (es ? 'Terminal de cruceros' : 'Cruise ship terminal') : ''),
    dropoff: clean(booking.drop_off_hotel),
    vehicle: pax <= 3 ? (es ? 'auto' : 'car') : (es ? 'minivan' : 'mini-van'),
    pickupKind: cruise ? (es ? 'la terminal de cruceros' : 'cruise ship terminal') : (es ? 'el hotel' : 'hotel'),
  }
}

/** "Saludos, Melina, en nombre de..." para los mails que arma la app (los de plantilla ya la traen). */
function signOffHtml(lang) {
  const team = lang === 'es' ? 'en nombre del equipo de Turismo Judaico' : 'on behalf of Judaic Tourism Team'
  const span = (t) => `<span style='font-family:"Trebuchet MS",sans-serif;color:rgb(0,0,0)'>${t}</span>`
  return `<div style="margin:0px">${span(lang === 'es' ? 'Saludos cordiales,' : 'Best regards,')}</div>` +
    `<div style="margin:0px">${span('Melina')}</div><div style="margin:0px">${span(team)}</div>`
}

/**
 * Cobro (rta 2): servicio, precio final, seña / pago total y forma de pago según el destino.
 * summary = paymentSummary(...) con el total ya calculado (con el descuento de cliente que repite, si corresponde).
 */
export function paymentMail(booking, summary, { returning = false, today } = {}) {
  const { tpl, lang } = pick('payment', booking)
  const flags = bookingFlags(booking, { returning, today })
  const vars = { ...commonVars(booking, lang), ...serviceFlagsVars(booking, summary, lang, flags) }
  const deposit = summary.options.find((o) => o.kind === 'DEPOSIT')
  const full = summary.options.find((o) => o.kind === 'FULL')
  Object.assign(vars, {
    totalUsd: usd(summary.total),
    depositUsd: usd(deposit ? deposit.amount : 0),
    balanceUsd: usd(deposit ? summary.balance - deposit.amount : summary.balance),
    dueUsd: usd(full ? full.amount : summary.balance),
    payLink: `${baseUrl()}/pay/${booking.booking_uuid}`,
  })
  const es = lang === 'es'
  return {
    subject: stageSubject('reply', booking, lang),
    html: withSignature(render(tpl, flags, vars)),
    review: null,
    language: lang,
  }
}

/**
 * Confirmación (rta 3): detalles de la reserva, lo pagado y lo que falta, datos del guía.
 * guide = fila de `guides` (o null). review != null si falta el guía o no tiene su párrafo en la plantilla.
 */
export function confirmationMail(booking, summary, guide, { returning = false, today } = {}) {
  const { tpl, lang } = pick('confirmation', booking)
  const flags = bookingFlags(booking, { returning, today })
  const vars = { ...commonVars(booking, lang), ...serviceFlagsVars(booking, summary, lang, flags) }
  const city = cityOf(booking.destination_name, lang)
  const key = guide ? guideKey(guide.full_name) : null
  if (key) flags.add(`guide:${key}`)
  const es = lang === 'es'
  const balanceNote = summary.balanceMethod === 'CASH'
    ? (es ? 'Por favor, entrégueselo en dólares en efectivo directamente al guía.' : 'Please give it in dollar cash directly to the guide.')
    : (es ? `Le enviaremos un recordatorio para pagarlo online antes del ${longDate(summary.balanceDueDate, 'es')}.`
      : `We will send you a reminder to pay it online before ${longDate(summary.balanceDueDate, 'en')}.`)
  Object.assign(vars, {
    paidUsd: usd(summary.paid),
    balanceUsd: usd(summary.balance),
    balanceNote,
    guideName: guide ? clean(guide.full_name) : '',
    guidePhone: guide ? clean(guide.phone) : '',
  })
  let review = null
  if (!NO_GUIDE_CITIES.includes(city.slug)) {
    if (!guide) review = 'Falta elegir el guía en el panel.'
    else if (!TEMPLATE_GUIDES.includes(key)) {
      review = `La plantilla de confirmación no tiene el párrafo de ${clean(guide.full_name)}: agregá sus datos antes de mandarla.`
    }
  }
  return {
    subject: stageSubject('confirmation', booking, lang),
    html: withSignature(render(tpl, flags, vars)),
    review,
    language: lang,
  }
}

/** TARDE: la reserva llegó con menos de una semana. Siempre queda como borrador (lo decide el equipo). */
export function lateMail(booking) {
  const { tpl, lang } = pick('late', booking)
  const vars = commonVars(booking, lang)
  return {
    subject: stageSubject('first', booking, lang),
    html: withSignature(render(tpl, new Set(), vars)),
    review: 'La reserva llegó con menos de una semana (TARDE): revisá si se puede hacer antes de mandar este mail.',
    language: lang,
  }
}

/** "Recibimos su consulta": sale directo cuando el cliente dejó un mensaje (la propuesta queda en borrador). */
export function receivedMail(booking) {
  const lang = booking.client_language === 'es' ? 'es' : 'en'
  const vars = commonVars(booking, lang)
  const p = (t) => `<div style='font-family:"trebuchet ms",sans-serif;color:#000000'>${t}</div>`
  const body = lang === 'es'
    ? [`Hola ${esc(vars.firstName)},`, '<br>',
      `¡Gracias por contactarse con Turismo Judaico! ☺🤗 Recibimos su consulta por el Tour Judaico en <b>${esc(vars.city)}</b> para el <b>${esc(vars.tourDateLong)}</b>.`,
      'Estamos leyendo su mensaje y consultando la disponibilidad con nuestro equipo local. Le respondemos a la brevedad con todos los detalles.', '<br>']
    : [`Dear ${esc(vars.firstName)},`, '<br>',
      `Thank you for getting in contact with Judaic Tourism! ☺🤗 We received your inquiry for the Jewish Tour in <b>${esc(vars.city)}</b> on <b>${esc(vars.tourDateLong)}</b>.`,
      'We are reading your message and checking availability with our local team. We will get back to you shortly with all the details.', '<br>']
  return {
    subject: stageSubject('first', booking, lang),
    html: withSignature('<div dir="ltr">\n' + body.map(p).join('\n') + '\n' + signOffHtml(lang) + '\n</div>'),
    review: null,
    language: lang,
  }
}
