import { prisma } from 'lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { post } = req.body

    const conditionsObj = {}
    Object.entries(req.body)
      .filter(([key, value]) => value !== '' && key !== 'post')
      .forEach(
        ([key, value]) =>
          (conditionsObj[`${key}Id`] = { equals: parseInt(value) })
      )

    try {
      const result = await prisma.post.findMany({
        where: {
          title: {
            contains: post,
          },
          ...conditionsObj,
        },
        include: {
          country: true,
          city: true,
          category: true,
          subCategory: true,
        },
      })
      if (!result)
        return res
          .status(404)
          .json({ error: 'No se encontraron posts con estas características' })
      res.status(200).json({ data: result })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Error interno' })
    }
  }
}
