// Escapa texto escrito por el cliente antes de meterlo en un mail HTML.
export const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

// Email simple y sin saltos de línea (evita inyectar cabeceras como "Bcc:").
export const isValidEmail = (value) =>
  typeof value === 'string' && !/[\r\n]/.test(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

export const refFooter = (uuid) =>
  `<p style="color: #bdc3c7; font-size: 11px; text-align: center; margin-top: 40px;">Ref: ${String(uuid).replace(/-/g, '')}</p>`
