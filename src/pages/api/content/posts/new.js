import { prisma } from 'lib/prisma'

function parseValueInt(value) {
  return Number.parseInt(value) || null
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { post, enPost, spPost } = req.body
    const { title, description, content } = spPost
    const {
      title: engTitle,
      description: engDescription,
      content: engContent,
    } = enPost

    if (
      !title ||
      !description ||
      !content ||
      !engTitle ||
      !engDescription ||
      !engContent
    ) {
      return res.status(400).json({
        error: 'Ambos posts deben tener los campos obligatorios completos',
      })
    }

    try {
      const result = await prisma.post.create({
        data: {
          countryId: post.countryId ? parseInt(post.countryId) : null,
          cityId: post.cityId ? parseInt(post.cityId) : null,
          categoryId: post.categoryId ? parseInt(post.categoryId) : null,
          subCategoryId: post.subCategoryId
            ? parseInt(post.subCategoryId)
            : null,
        },
      })

      await prisma.postEntry.create({
        data: { ...spPost, postId: result.id },
      })
      await prisma.postEntry.create({
        data: { ...enPost, postId: result.id },
      })
      res
        .status(201)
        .json({ data: result, message: 'Post creado exitosamente' })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Error del servidor' })
    }
  }
}
