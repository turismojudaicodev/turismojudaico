export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(403).json({ error: 'Method not allowed' })
  res.status(200).json({ success: 'Suscription completed' })
}
