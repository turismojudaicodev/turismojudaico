export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(403).json({ error: 'Method not allowed' })

  return res.status(500).json({
    error:
      'De momento no está habilitada la suscripción a la newsletter, pronto será corregido',
  })
}
