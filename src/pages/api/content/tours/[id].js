import { prisma } from 'lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const tourId = Number.parseInt(req.query.id)
    await prisma.tourEntry.deleteMany({
      where: {
        tourId,
      },
    })
    const result = await prisma.tour.delete({
      where: {
        id: tourId,
      },
    })
    res
      .status(200)
      .json({ message: `Tour con id "${result.id}" borrado exitosamente` })
  }
  // else if (req.method === 'PUT') {
  //   const { enTour, spTour } = req.body
  //   const { title, description, content } = spTour
  //   const {
  //     title: engTitle,
  //     description: engDescription,
  //     content: engContent,
  //   } = enTour

  //   if (
  //     !title ||
  //     !description ||
  //     !content ||
  //     !engTitle ||
  //     !engDescription ||
  //     !engContent
  //   ) {
  //     return res.status(400).json({
  //       error: 'Ambos tours deben tener los campos obligatorios completos',
  //     })
  //   }
  //   const updatedSpanishTour = await prisma.tourEntry.update({
  //     where: { id: spTour.id },
  //     data: spTour,
  //   })
  //   const updatedEnglishTour = await prisma.tourEntry.update({
  //     where: { id: enTour.id },
  //     data: enTour,
  //   })
  //   res.status(200).json({
  //     data: { updatedSpanishTour, updatedEnglishTour },
  //     message: 'Tour actualizado exitosamente',
  //   })
  // }
}
