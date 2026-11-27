// Flags de una reserva para elegir las secciones de las plantillas (ver scripts/mail-templates/spec.py).

const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

// Orden importante: "punta del este" antes que cualquier otra cosa que pueda coincidir.
const CITIES = [
  ['buenos aires', 'ba', 'Buenos Aires', 'Buenos Aires'],
  ['rio de janeiro', 'rio', 'Rio de Janeiro', 'Río de Janeiro'],
  ['sao paulo', 'saopaulo', 'São Paulo', 'San Pablo'],
  ['santos', 'santos', 'Santos', 'Santos'],
  ['recife', 'recife', 'Recife', 'Recife'],
  ['santiago', 'santiago', 'Santiago de Chile', 'Santiago de Chile'],
  ['punta del este', 'puntadeleste', 'Punta del Este', 'Punta del Este'],
  ['montevideo', 'montevideo', 'Montevideo', 'Montevideo'],
  ['lima', 'lima', 'Lima', 'Lima'],
  ['panama', 'panama', 'Panama', 'Panamá'],
  ['bogota', 'bogota', 'Bogotá', 'Bogotá'],
  ['cartagena', 'cartagena', 'Cartagena', 'Cartagena'],
  ['puerto rico', 'puertorico', 'Puerto Rico', 'Puerto Rico'],
  ['mexico', 'mexico', 'Mexico City', 'Ciudad de México'],
  ['curazao', 'curazao', 'Curaçao', 'Curazao'],
  ['curacao', 'curazao', 'Curaçao', 'Curazao'],
  ['costa rica', 'costarica', 'Costa Rica', 'Costa Rica'],
]

/** { slug, name } de la ciudad del destino, o slug null si no la conocemos. */
export function cityOf(destinationName, language = 'en') {
  const d = norm(destinationName)
  const hit = CITIES.find(([key]) => d.includes(key))
  if (!hit) {
    const raw = String(destinationName || '').trim().replace(/^tour judaico (en )?/i, '')
    return { slug: null, name: raw }
  }
  return { slug: hit[1], name: language === 'es' ? hit[3] : hit[2] }
}

/** YYYY-MM-DD de un DATE de MySQL (Date o texto). */
export function isoDate(value) {
  if (!value) return null
  if (value instanceof Date) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
  }
  return String(value).slice(0, 10)
}

export const daysUntil = (tourIso, todayIso) =>
  Math.round((Date.parse(`${tourIso}T12:00:00Z`) - Date.parse(`${todayIso}T12:00:00Z`)) / 86400000)

export function parseAnswers(booking) {
  try {
    const a = typeof booking.booking_answers_json === 'string' ? JSON.parse(booking.booking_answers_json) : booking.booking_answers_json
    return { cruise: a?.cruise || null, kosher: !!a?.kosher, luggage: !!a?.luggage }
  } catch {
    return { cruise: null, kosher: false, luggage: false }
  }
}

/**
 * Flags de la reserva. `returning` lo calcula quien llama (hace falta la base).
 * `today` (YYYY-MM-DD) se puede pasar para las pruebas.
 */
export function bookingFlags(booking, { returning = false, today = new Date().toISOString().slice(0, 10) } = {}) {
  const flags = new Set()
  const city = cityOf(booking.destination_name)
  if (city.slug) flags.add(`city:${city.slug}`)
  if (booking.security_policy_applied) flags.add(`policy:${booking.security_policy_applied}`)

  const answers = parseAnswers(booking)
  if (answers.cruise) {
    flags.add('cruise')
    flags.add(`port:${answers.cruise.port || 'otro'}`)
  }
  if (answers.kosher) flags.add('kosher')
  if (answers.luggage) flags.add('luggage')
  if (returning) flags.add('returning')

  const tour = isoDate(booking.tour_date)
  if (tour) {
    const d = new Date(`${tour}T12:00:00Z`)
    if (d.getUTCDay() === 0) flags.add('sunday')
    if ([12, 1, 2].includes(d.getUTCMonth() + 1)) flags.add('high')
    const days = daysUntil(tour, today)
    if (days > 60) flags.add('far')
    if (days < 7) flags.add('late')
  }

  const pax = Number(booking.pax_adults || 0) + Number(booking.pax_children || 0) || 1
  flags.add(pax >= 4 ? 'pax:4+' : `pax:${pax}`)
  if (pax >= 3 && pax <= 5) flags.add('pax:3-5')
  if (pax >= 6 && pax <= 8) flags.add('pax:6-8')
  if (pax >= 9) flags.add('pax:9+')
  flags.add(`lang:${booking.client_language === 'es' ? 'es' : 'en'}`)
  return flags
}

/** "Sunday, December 28th, 2025" / "domingo 28 de diciembre de 2025" */
export function longDate(value, language = 'en') {
  const iso = isoDate(value)
  if (!iso) return ''
  const d = new Date(`${iso}T12:00:00Z`)
  if (language === 'es') {
    return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).replace(',', '')
  }
  const day = d.getUTCDate()
  const suffix = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th'
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
  const month = d.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' })
  return `${weekday}, ${month} ${day}${suffix}, ${d.getUTCFullYear()}`
}
