export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(403).json({ error: 'Method not allowed' })

  try {
    const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID
    const API_KEY = process.env.MAILCHIMP_API_KEY
    const DATACENTER = process.env.MAILCHIMP_API_SERVER
    const data = {
      email_address: req.body.email,
      firstName: req.body.name,
      lastName: req.body.lastName,
      status: 'subscribed',
    }

    const response = await fetch(
      `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`,
      {
        body: JSON.stringify(data),
        headers: {
          Authorization: `Basic ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }
    )

    const r = await response.json()
    console.log(r)

    if (r.status === 403) return res.status(403).json({ error: `${r.detail}` })

    return res
      .status(201)
      .json({ success: 'Suscribed to newsletter succesfully' })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
