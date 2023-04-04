import { prisma } from 'lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { country } = req.body
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
