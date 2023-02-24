import nodemailer from 'nodemailer'

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(403).json({ error: 'Method not allowed' })

  const transporter = nodemailer.createTransport({
    host: 'http://localhost',
    port: 587,
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: 'username',
      pass: 'password',
    },
  })

  const mailData = {
    from: 'demo@demo.com',
    to: 'your email',
    subject: `Message From ${req.body.name}`,
    text: req.body.message,
    html: <div>{req.body.message}</div>,
  }

  transporter.sendMail(mailData, (err, info) => {
    if (err) console.log(err)
    else console.log(info)
  })

  res.status(200)
}
