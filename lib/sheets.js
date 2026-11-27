// Seguimiento de pagos en Google Sheets (planilla aparte, una pestaña por año, bloques por mes del tour).
//
// La app escribe SOLO sus columnas. "GASTOS DEL TOUR", "GUIA" y "¿se le pagó al guía?" las cargan a mano
// y la app nunca las toca. Cada fila tiene una clave en la columna O (oculta) y se busca por esa clave,
// así que ordenar o mover filas en la planilla no rompe nada.
//
// Filas por reserva (en el mes de la fecha del tour):
//   - una por cada pago anticipado confirmado (seña / total / saldo online), con fecha, comisión y medio;
//   - una "fila del tour": pax, destino y lo que queda por cobrar en efectivo (se completa la fecha cuando se registra).
import { google } from 'googleapis'
import { db } from './mysql'
import { paymentPlan } from './payments'

const q = async (sql, params = []) => (await db.promise().query(sql, params))[0]

export const HEADERS = [
  '', 'PASAJERO', 'cant pax', 'FECHA', 'DESTINO', 'USD COBRADO', 'fecha de pago', 'menos comisión de plataforma',
  'DONDE PAGARON', 'GASTOS DEL TOUR', 'GUIA', '¿se le pagó al guía?', 'EMAILS', 'GANANCIA', 'REF (no tocar)',
]
// Columnas que escribe la app (índices). J, K y L (9, 10, 11) son manuales.
const SYSTEM_LEFT = [0, 8] // A..I
const SYSTEM_RIGHT = [12, 14] // M..O
const COL_KEY = 14

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const METHOD = { STRIPE: 'Stripe', ZELLE: 'Zelle', CASH: 'efectivo' }
const KIND = { DEPOSIT: 'seña', FULL: 'total', BALANCE: 'saldo', OTHER: 'otro' }

const PURPLE = { red: 0.6, green: 0.2, blue: 1 }
const WHITE = { red: 1, green: 1, blue: 1 }

// Autenticación: el mismo cliente OAuth que usa Gmail (GMAIL_CLIENT_ID/SECRET) con un refresh token
// propio para Sheets (GOOGLE_SHEETS_REFRESH_TOKEN), generado en el OAuth Playground con la cuenta dueña
// de la planilla. Así no se toca el token de Gmail. (La organización no permite claves de cuentas de servicio;
// si algún día se habilitan, también se acepta GOOGLE_SERVICE_ACCOUNT_EMAIL/KEY.)
const usesOAuth = () => !!(process.env.GOOGLE_SHEETS_REFRESH_TOKEN && process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET)
const usesServiceAccount = () => !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_KEY)

export function sheetsConfigured() {
  return !!process.env.GOOGLE_SHEETS_ID && (usesOAuth() || usesServiceAccount())
}

let client
function getClient() {
  if (client) return client
  let auth
  if (usesOAuth()) {
    auth = new google.auth.OAuth2(process.env.GMAIL_CLIENT_ID, process.env.GMAIL_CLIENT_SECRET, 'https://developers.google.com/oauthplayground')
    auth.setCredentials({ refresh_token: process.env.GOOGLE_SHEETS_REFRESH_TOKEN })
  } else {
    auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: String(process.env.GOOGLE_SERVICE_ACCOUNT_KEY).replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
  }
  client = google.sheets({ version: 'v4', auth })
  return client
}

const colLetter = (i) => String.fromCharCode(65 + i)
const round2 = (n) => Math.round(Number(n || 0) * 100) / 100

/** Texto que viene del cliente: nunca se interpreta como fórmula. */
export function safeText(v) {
  const s = String(v ?? '').replace(/[\r\n\t]+/g, ' ').trim()
  return /^[=+\-@]/.test(s) ? `'${s}` : s
}

function isoDate(value) {
  if (!value) return ''
  if (value instanceof Date) {
    const y = value.getFullYear()
    return `${y}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
  }
  return String(value).slice(0, 10)
}

function cityLabel(destinationName) {
  return String(destinationName || '').trim().replace(/^Tour Judaico (en )?/i, '').trim()
}

/** Filas que la reserva tiene que tener en la planilla (sin número de fila). Puro: se prueba sin Google. */
export function desiredRows(booking, payments) {
  const tourDate = isoDate(booking.tour_date)
  const counted = payments.filter((p) => p.status === 'CONFIRMED' || p.status === 'REFUNDED')
  if (!tourDate || counted.length === 0) return []

  const uuid = booking.booking_uuid
  const cancelled = booking.status === 'CANCELLED'
  const name = safeText(booking.client_name)
  const email = safeText(booking.client_email)
  const rows = []

  // Pagos anticipados: todo lo que no sea el saldo en efectivo al guía.
  const advance = counted.filter((p) => !(p.method === 'CASH' && p.kind === 'BALANCE'))
  for (const p of advance) {
    const refunded = p.status === 'REFUNDED'
    rows.push({
      key: `${tourDate}|${uuid}|PAY:${String(p.id).padStart(8, '0')}`,
      cells: [
        '', name, '', tourDate, (KIND[p.kind] || 'pago') + (refunded ? ' (reembolsado)' : ''),
        // Con tarjeta entra el monto + el 5% de recargo.
        refunded ? 0 : round2(Number(p.amount_usd) + Number(p.surcharge_usd || 0)), isoDate(p.confirmed_at || p.created_at),
        p.fee_usd == null ? '' : round2(p.fee_usd), METHOD[p.method] + (Number(p.surcharge_usd) > 0 ? ' (+5%)' : '') + (refunded ? ' (reembolsado)' : ''),
      ],
      right: [email],
    })
  }

  // Fila del tour: lo que se cobra en efectivo el día del tour.
  const advancePaid = round2(advance.filter((p) => p.status === 'CONFIRMED').reduce((s, p) => s + Number(p.amount_usd), 0))
  const cash = counted.filter((p) => p.method === 'CASH' && p.kind === 'BALANCE' && p.status === 'CONFIRMED')
  const cashPaid = round2(cash.reduce((s, p) => s + Number(p.amount_usd), 0))
  const expected = cancelled ? 0 : round2(Math.max(Number(booking.total_price_usd) - advancePaid, 0))
  const lastCash = cash.at(-1)
  // Saldo pendiente: en efectivo al guía (BA, Chile, Lima, Río) u online (resto).
  const pending = paymentPlan(booking.destination_name).balance === 'ONLINE' && booking.payment_method !== 'CASH' ? 'online (a cobrar)' : 'efectivo (a cobrar)'
  rows.push({
    key: `${tourDate}|${uuid}|TOUR`,
    cells: [
      cancelled ? 0 : 1, name, Number(booking.pax_adults || 0) + Number(booking.pax_children || 0) || '', tourDate,
      safeText(cityLabel(booking.destination_name)) + (cancelled ? ' (CANCELADA)' : ''),
      cashPaid > 0 ? cashPaid : expected, lastCash ? isoDate(lastCash.confirmed_at || lastCash.created_at) : '', '',
      expected === 0 && cashPaid === 0 ? '—' : cashPaid >= expected && cashPaid > 0 ? 'efectivo' : pending,
    ],
    right: [''],
  })
  return rows
}

// ---------------------------------------------------------------------------------------------
// Acceso a la planilla.
//
// Google limita a 60 lecturas y 60 escrituras por minuto. Por eso cada actualización (1 reserva o todas)
// hace siempre la misma cantidad de llamadas: lee pestañas y claves una vez, arma en memoria dónde va
// cada fila, y escribe todo junto (1 llamada de estructura + 1 de valores).

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Reintenta si Google responde "demasiadas llamadas" (429) o un error temporal (5xx). */
async function withRetry(fn, tries = 4) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn()
    } catch (error) {
      const status = Number(error?.code || error?.response?.status)
      if (attempt >= tries - 1 || !(status === 429 || status >= 500)) throw error
      await sleep(2000 * 2 ** attempt)
    }
  }
}

const isYearTab = (title) => /^\d{4}$/.test(title)
// Sin comas: la planilla está en español (separador ';') y la API interpreta según el idioma de la planilla.
const sumCol = (c, head) => `=SUM(${c}${head}:INDIRECT("${c}"&(ROW()-1)))`
const whiteRows = (sheetId, start, count) => ({
  repeatCell: {
    range: { sheetId, startRowIndex: start, endRowIndex: start + count },
    cell: { userEnteredFormat: { backgroundColor: WHITE, textFormat: { bold: false, foregroundColor: { red: 0, green: 0, blue: 0 } } } },
    fields: 'userEnteredFormat(backgroundColor,textFormat)',
  },
})
const insertAt = (sheetId, index, count) => ({
  insertDimension: { range: { sheetId, dimension: 'ROWS', startIndex: index, endIndex: index + count }, inheritFromBefore: false },
})

function newTabRequests(sheetId, title) {
  return [
    { addSheet: { properties: { sheetId, title, gridProperties: { frozenRowCount: 1, columnCount: HEADERS.length } } } },
    { repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1 }, cell: { userEnteredFormat: { textFormat: { bold: true }, wrapStrategy: 'WRAP', verticalAlignment: 'BOTTOM' } }, fields: 'userEnteredFormat(textFormat,wrapStrategy,verticalAlignment)' } },
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: COL_KEY, endIndex: COL_KEY + 1 }, properties: { hiddenByUser: true }, fields: 'hiddenByUser' } },
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 }, properties: { pixelSize: 200 }, fields: 'pixelSize' } },
    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 12, endIndex: 13 }, properties: { pixelSize: 220 }, fields: 'pixelSize' } },
    ...[3, 6].map((c) => ({ repeatCell: { range: { sheetId, startRowIndex: 1, startColumnIndex: c, endColumnIndex: c + 1 }, cell: { userEnteredFormat: { numberFormat: { type: 'DATE', pattern: 'd-mmm-yyyy' } } }, fields: 'userEnteredFormat.numberFormat' } })),
    ...[5, 7, 9, 13].map((c) => ({ repeatCell: { range: { sheetId, startRowIndex: 1, startColumnIndex: c, endColumnIndex: c + 1 }, cell: { userEnteredFormat: { numberFormat: { type: 'CURRENCY', pattern: '"US$"#,##0.00' } } }, fields: 'userEnteredFormat.numberFormat' } })),
  ]
}

/** Dónde va un mes nuevo: antes del primer mes posterior, o después del separador del último. */
function monthInsertIndex(keys, ym) {
  for (let i = 1; i < keys.length; i++) {
    if (keys[i].startsWith('MES:') && keys[i].slice(4) > ym) return i
  }
  let lastEnd = -1
  keys.forEach((k, i) => { if (k.startsWith('FIN:')) lastEnd = i })
  return lastEnd >= 0 ? lastEnd + 2 : 2 // pestaña vacía: fila 1 títulos, fila 2 en blanco
}

/** Dónde va una fila dentro del bloque del mes: ordenada por clave (fecha del tour, reserva, pagos antes que el tour). */
function rowInsertIndex(keys, ym, key) {
  const start = keys.indexOf(`MES:${ym}`)
  const end = keys.indexOf(`FIN:${ym}`)
  for (let i = start + 1; i < end; i++) {
    if (keys[i] && keys[i] > key) return i
  }
  return end
}

function spliceAt(keys, index, ...items) {
  while (keys.length < index) keys.push('')
  keys.splice(index, 0, ...items)
}

/** Lleva una o varias reservas a la planilla. Idempotente. Devuelve { written, removed }. */
export async function syncBookingsToSheet(uuids) {
  if (!sheetsConfigured()) return { skipped: 'sin configurar' }
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID
  const sheets = getClient()

  // 1. Filas que corresponden según la base.
  const plans = []
  for (const uuid of uuids) {
    const [booking] = await q('SELECT * FROM bookings_pipeline WHERE booking_uuid = ?', [uuid])
    if (!booking) continue
    const payments = await q('SELECT * FROM booking_payments WHERE booking_uuid = ? ORDER BY id ASC', [uuid])
    plans.push({ uuid, rows: desiredRows(booking, payments) })
  }
  const uuidSet = new Set(plans.map((p) => p.uuid))
  const wanted = new Set(plans.flatMap((p) => p.rows.map((r) => r.key)))

  // 2. Pestañas y claves actuales (2 lecturas).
  const meta = await withRetry(() => sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties' }))
  const model = new Map()
  const yearTabs = meta.data.sheets.map((s) => s.properties).filter((p) => isYearTab(p.title))
  if (yearTabs.length) {
    const got = await withRetry(() => sheets.spreadsheets.values.batchGet({ spreadsheetId, ranges: yearTabs.map((t) => `'${t.title}'!O1:O`) }))
    yearTabs.forEach((t, i) => {
      const values = got.data.valueRanges?.[i]?.values || []
      model.set(t.title, { sheetId: t.sheetId, keys: values.map((row) => String(row?.[0] ?? '')), created: false })
    })
  }
  const usedIds = new Set(meta.data.sheets.map((s) => s.properties.sheetId))

  // 3. Filas viejas de estas reservas (cambió la fecha, etc.) y lo cargado a mano en ellas (1 lectura, solo si hay).
  const stale = []
  for (const [title, tab] of model) {
    tab.keys.forEach((k, i) => {
      const parts = k.split('|')
      if (parts.length === 3 && uuidSet.has(parts[1]) && !wanted.has(k)) stale.push({ title, index: i, key: k })
    })
  }
  const carry = {}
  if (stale.length) {
    const got = await withRetry(() => sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: stale.map((s) => `'${s.title}'!J${s.index + 1}:L${s.index + 1}`),
      valueRenderOption: 'UNFORMATTED_VALUE',
    }))
    stale.forEach((s, i) => {
      const v = got.data.valueRanges?.[i]?.values?.[0]
      const [, uuid, part] = s.key.split('|')
      if (v && v.some((x) => x !== '' && x != null)) carry[`${uuid}|${part}`] = [v[0] ?? '', v[1] ?? '', v[2] ?? '']
    })
  }

  // 4. Cambios de estructura, aplicados sobre el modelo en el mismo orden en que los aplica Google.
  const requests = []
  const byTab = {}
  for (const s of stale) (byTab[s.title] ??= []).push(s.index)
  for (const [title, indexes] of Object.entries(byTab)) {
    const tab = model.get(title)
    for (const i of indexes.sort((a, b) => b - a)) {
      requests.push({ deleteDimension: { range: { sheetId: tab.sheetId, dimension: 'ROWS', startIndex: i, endIndex: i + 1 } } })
      tab.keys.splice(i, 1)
    }
  }

  const newMonths = []
  const carryWrites = []
  for (const plan of plans) {
    if (plan.rows.length === 0) continue
    const tourDate = plan.rows[0].key.slice(0, 10)
    const title = tourDate.slice(0, 4)
    const ym = tourDate.slice(0, 7)

    if (!model.has(title)) {
      let sheetId
      do sheetId = 100000000 + Math.floor(Math.random() * 900000000)
      while (usedIds.has(sheetId))
      usedIds.add(sheetId)
      requests.push(...newTabRequests(sheetId, title))
      model.set(title, { sheetId, keys: ['REF (no tocar)'], created: true })
    }
    const tab = model.get(title)

    if (!tab.keys.includes(`MES:${ym}`)) {
      const at = monthInsertIndex(tab.keys, ym)
      spliceAt(tab.keys, at, `MES:${ym}`, `FIN:${ym}`, '')
      requests.push(
        insertAt(tab.sheetId, at, 3),
        whiteRows(tab.sheetId, at, 3),
        { repeatCell: { range: { sheetId: tab.sheetId, startRowIndex: at, endRowIndex: at + 1 }, cell: { userEnteredFormat: { backgroundColor: PURPLE, textFormat: { bold: true, foregroundColor: WHITE } } }, fields: 'userEnteredFormat(backgroundColor,textFormat)' } },
        { repeatCell: { range: { sheetId: tab.sheetId, startRowIndex: at + 1, endRowIndex: at + 2 }, cell: { userEnteredFormat: { textFormat: { bold: true } } }, fields: 'userEnteredFormat.textFormat' } },
      )
      newMonths.push({ title, ym })
    }

    for (const row of plan.rows) {
      if (tab.keys.includes(row.key)) continue
      const at = rowInsertIndex(tab.keys, ym, row.key)
      spliceAt(tab.keys, at, row.key)
      requests.push(insertAt(tab.sheetId, at, 1), whiteRows(tab.sheetId, at, 1))
      const manual = carry[`${plan.uuid}|${row.key.split('|')[2]}`]
      if (manual) carryWrites.push({ title, key: row.key, values: manual })
    }
  }
  if (requests.length) await withRetry(() => sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } }))

  // 5. Valores, con las posiciones finales (1 escritura cada 1000 rangos).
  const data = []
  const rowOf = (title, key) => model.get(title).keys.indexOf(key) + 1
  for (const [title, tab] of model) {
    if (tab.created) data.push({ range: `'${title}'!A1:O1`, values: [HEADERS] })
  }
  // Encabezado y total de cada mes tocado (los nuevos y los existentes: así se reparan si alguien los rompe).
  const months = new Map(newMonths.map((x) => [`${x.title}|${x.ym}`, x]))
  for (const plan of plans) for (const row of plan.rows) months.set(`${row.key.slice(0, 4)}|${row.key.slice(0, 7)}`, { title: row.key.slice(0, 4), ym: row.key.slice(0, 7) })
  for (const { title, ym } of months.values()) {
    const head = rowOf(title, `MES:${ym}`)
    const end = rowOf(title, `FIN:${ym}`)
    const [y, m] = ym.split('-').map(Number)
    data.push(
      { range: `'${title}'!A${head}:O${head}`, values: [[`=SUM(INDIRECT("A"&(ROW()+1)):A${end})`, `${MONTHS[m - 1]} ${y}`, '', '', '', '', '', '', '', '', '', '', '', '', `MES:${ym}`]] },
      { range: `'${title}'!A${end}:O${end}`, values: [['', `TOTAL ${MONTHS[m - 1].slice(0, 3).toUpperCase()}`, '', '', '', sumCol('F', head), '', sumCol('H', head), '', sumCol('J', head), '', '', '', sumCol('N', head), `FIN:${ym}`]] },
    )
  }
  let written = 0
  const [l0, l1] = SYSTEM_LEFT
  const [r0, r1] = SYSTEM_RIGHT
  for (const plan of plans) {
    for (const row of plan.rows) {
      const title = row.key.slice(0, 4)
      const r = rowOf(title, row.key)
      data.push(
        { range: `'${title}'!${colLetter(l0)}${r}:${colLetter(l1)}${r}`, values: [row.cells] },
        { range: `'${title}'!${colLetter(r0)}${r}:${colLetter(r1)}${r}`, values: [[...row.right, `=F${r}-H${r}-J${r}`, row.key]] },
      )
      written++
    }
  }
  for (const c of carryWrites) {
    const r = rowOf(c.title, c.key)
    data.push({ range: `'${c.title}'!J${r}:L${r}`, values: [c.values] })
  }
  for (let i = 0; i < data.length; i += 1000) {
    const chunk = data.slice(i, i + 1000)
    await withRetry(() => sheets.spreadsheets.values.batchUpdate({ spreadsheetId, requestBody: { valueInputOption: 'USER_ENTERED', data: chunk } }))
  }
  return { written, removed: stale.length }
}

export const syncBookingToSheet = (uuid) => syncBookingsToSheet([uuid])

/** Para el webhook y el panel: nunca corta el flujo si Google falla. */
export async function syncBookingToSheetSafe(uuid) {
  try {
    return await syncBookingToSheet(uuid)
  } catch (error) {
    console.error('Planilla: no se pudo actualizar la reserva', uuid, error?.message || error)
    return { error: true }
  }
}
