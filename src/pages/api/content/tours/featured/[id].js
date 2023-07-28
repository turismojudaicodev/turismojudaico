import { prisma } from 'lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const tourId = req.query.id
    const { featured } = req.body

    try {
      await prisma.tour.update({
        where: {
          id: parseInt(tourId),
        },
        data: {
          featured: featured,
        },
      })

      res
        .status(200)
        .json({ message: `Tour ${tourId} modificado exitosamente` })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}
