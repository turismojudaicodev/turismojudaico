import { PrismaClient } from '@prisma/client'
import { prisma } from 'lib/prisma'

const a = new PrismaClient()
a.post.findMany({
  where: {},
})

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { post, country, city, category, subCategory } = req.body
    console.log(req.body)
    try {
      const result = await prisma.post.findMany({
        where: {
          title: {
            contains: post,
          },
          countryId: {
            equals: parseInt(country) || null,
          },
          cityId: {
            equals: parseInt(city) || null,
          },
          categoryId: {
            equals: parseInt(category) || null,
          },
          subCategoryId: {
            equals: parseInt(subCategory) || null,
          },
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
