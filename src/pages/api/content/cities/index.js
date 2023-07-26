// import { PrismaClient } from '@prisma/client'
import { prisma } from 'lib/prisma'
// const a = new PrismaClient()
// a.city.create({ data: {}})
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, englishName, countryId } = req.body
    if (!name || !englishName || !countryId)
      return res.status(400).json({
        error: 'Falta el nombre de la ciudad o el país al que pertenece',
      })
    const response = await prisma.city.create({
      data: { name, englishName, countryId: Number.parseInt(countryId) },
      include: { country: true },
    })
    res.status(201).json({
      message: `${req.body.name} agregada correctamente`,
      data: response,
    })
  }
}
