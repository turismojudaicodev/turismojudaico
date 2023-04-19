import { prisma } from 'lib/prisma'

function parseValueInt(value) {
  return Number.parseInt(value) || null
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const {
      title,
      description,
      content,
      active,
      countryId,
      cityId,
      categoryId,
      subCategoryId,
    } = req.body
    if (!title || !description || !content)
      return res
        .status(400)
        .json({ error: 'Falta algún dato obligatorio del posts' })
    try {
      const result = await prisma.post.create({
        data: {
          title,
          description,
          content,
          active,
          countryId: parseValueInt(countryId),
          cityId: parseValueInt(cityId),
          categoryId: parseValueInt(categoryId),
          subCategoryId: parseValueInt(subCategoryId),
        },
      })
      res.status(201).json({
        message: `Post ${result.title} creado exitosamente`,
        data: result,
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Error interno' })
    }
  }
}
