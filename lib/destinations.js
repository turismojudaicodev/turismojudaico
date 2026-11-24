// Traduce el nombre del tour (ej. "Tour Judaico en Buenos Aires", "Tour Judaico Rio de Janeiro  ")
// a la ciudad que usan las tarifas (lib/pricing.js) y el formulario de seguridad (/security/[uuid]).
// Orden importa: las claves más específicas van primero.
const CITY_KEYS = [
  ['buenos aires', 'Buenos Aires'],
  ['rio de janeiro', 'Rio de Janeiro'],
  ['punta del este', 'Punta del Este'],
  ['montevideo', 'Montevideo'],
  ['santiago', 'Santiago de Chile'],
  ['sao paulo', 'São Paulo'],
  ['santos', 'Santos'],
  ['recife', 'Recife'],
  ['lima', 'Lima'],
  ['panama', 'Panama'],
  ['bogota', 'Bogota'],
  ['cartagena', 'Cartagena'],
  ['puerto rico', 'Puerto Rico'],
  ['curazao', 'Curazao'],
  ['curacao', 'Curazao'],
]

export const normalizeName = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

export function resolveCity(destinationName) {
  const n = normalizeName(destinationName)
  if (!n) return null
  const found = CITY_KEYS.find(([key]) => new RegExp(`\\b${key}\\b`).test(n))
  return found ? found[1] : null
}
