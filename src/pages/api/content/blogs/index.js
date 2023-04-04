import { prisma } from 'lib/prisma'

// return { error or data object dependeing on success}
export default async function handler(req, res) {
  if (req.method === 'GET') {
  } else if (req.method === 'POST') {
    const { title, description, image, content } = req.body
    if (!title || !description || !content) {
      return res.status(400).json({ error: 'Campos obligatorios incompletos' })
    }
    const result = await prisma.blog.create({
      data: {
        title,
        description,
        content,
      },
    })
    res.status(201).json({ data: result, message: 'Blog creado exitosamente' })
  } else {
    res.status(405).json({ error: 'Method  not allowed' })
  }
}
