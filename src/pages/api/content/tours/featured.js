import { prisma } from 'lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const featuredTours = req.body

    try {
      await prisma.tour.updateMany({
        where: {
          featured: true,
        },
        data: {
          featured: false,
        },
      })

      for (const tourId of featuredTours) {
        await prisma.tour.update({
          where: { id: parseInt(tourId) },
          data: { featured: true },
        })
      }

      res
        .status(200)
        .json({ message: 'Tours destacados modificados correctamente' })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}
