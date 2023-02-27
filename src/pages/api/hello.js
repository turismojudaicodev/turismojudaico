// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// const mailchimp = require('@mailchimp/mailchimp_marketing')
import mailchimp from '@mailchimp/mailchimp_marketing'

export default async function handler(req, res) {
  // res.status(200).json({ name: 'John Doe' }

  try {
    mailchimp.setConfig({
      apiKey: `${process.env.MAILCHIMP_API_KEY_SEC}`,
      server: `${process.env.MAILCHIMP_API_SERVER}`,
    })

    const response = await mailchimp.ping.get()
    console.log('respuesta', response)

    res.status(201).json({ response: response })
  } catch (error) {
    console.log('error', error)
    res.status(400).json({ error: error.message })
  }
}
