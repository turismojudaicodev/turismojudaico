import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER,
    pass: process.env.NODEMAILER_PASS,
  },
})

export const mailOptions = {
  from: process.env.NODEMAILER,
  // to: process.env.NODEMAILER,
  to: process.env.NODEMAILER_TO,
}
