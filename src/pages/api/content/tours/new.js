import { prisma } from 'lib/prisma'
import { uploadImage } from 'lib/cloudinary'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { tour, spTour, enTour } = req.body
    const { title, description, content } = spTour
    const {
      title: engTitle,
      description: engDescription,
      content: engContent,
    } = enTour

    if (
      !title ||
      !description ||
      !content ||
      !engTitle ||
      !engDescription ||
      !engContent
    ) {
      return res.status(400).json({
        error: 'Ambos tours deben tener los campos obligatorios completos',
      })
    }

    try {
      const newTour = await prisma.tour.create({
        data: {
          countryId: tour.countryId ? parseInt(tour.countryId) : null,
        },
      })

      const spanishTour = await prisma.tourEntry.create({
        data: { ...spTour, tourId: newTour.id },
      })
      const englishTour = await prisma.tourEntry.create({
        data: { ...enTour, tourId: newTour.id },
      })

      if (tour.posts.length > 0) {
        for (const id of tour.posts) {
          const postRes = await prisma.post.update({
            where: { id: parseInt(id) },
            data: { tourId: newTour.id },
          })
          // console.log('post res:', postRes)
        }
      }

      res.status(201).json({
        message: `Post ${newTour.id} creado exitosamente`,
        data: newTour,
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
}
