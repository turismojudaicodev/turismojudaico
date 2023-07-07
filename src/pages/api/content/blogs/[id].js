import { prisma } from 'lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const blogId = Number.parseInt(req.query.id)
    const result = await prisma.blog.delete({
      where: {
        id: blogId,
      },
    })
    res
      .status(200)
      .json({ message: `Blog "${result.title}" borrado exitosamente` })
  } else if (req.method === 'PUT') {
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
    const updatedSpanishBlog = await prisma.blogEntry.update({
      where: { id: spBlog.id },
      data: spBlog,
    })
    const updatedEnglishBlog = await prisma.blogEntry.update({
      where: { id: enBlog.id },
      data: enBlog,
    })
    res.status(200).json({
      data: { updatedSpanishBlog, updatedEnglishBlog },
      message: 'Blog actualizado exitosamente',
    })
  }
}
