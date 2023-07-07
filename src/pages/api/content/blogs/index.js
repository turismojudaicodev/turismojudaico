import { prisma } from 'lib/prisma'

// return { error or data object dependeing on success}
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { enBlog, spBlog } = req.body
    const { title, description, content } = spBlog
    const {
      title: engTitle,
      description: engDescription,
      content: engContent,
    } = enBlog

    if (
      !title ||
      !description ||
      !content ||
      !engTitle ||
      !engDescription ||
      !engContent
    ) {
      return res.status(400).json({
        error: 'Ambos blogs deben tener los campos obligatorios completos',
      })
    }
    const result = await prisma.blog.create({ data: {} })

    await prisma.blogEntry.create({
      data: { ...spBlog, blogId: result.id },
    })
    await prisma.blogEntry.create({
      data: { ...enBlog, blogId: result.id },
    })
    res.status(201).json({ data: result, message: 'Blog creado exitosamente' })
  } else {
    res.status(405).json({ error: 'Method  not allowed' })
  }
}
