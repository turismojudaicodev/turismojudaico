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
    const blogId = Number.parseInt(req.query.id)
    const formData = req.body
    const result = await prisma.blog.update({
      where: { id: blogId },
      data: formData,
    })
    res.status(200).json({
      data: result,
      message: `Blog "${result.title}" actualizado exitosamente`,
    })
  }
}
