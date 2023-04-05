import { prisma } from 'lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const postId = Number.parseInt(req.query.id)
    const result = await prisma.post.delete({
      where: {
        id: postId,
      },
    })
    res
      .status(200)
      .json({ message: `Post "${result.title}" borrado exitosamente` })
  } else if (req.method === 'PUT') {
    const postId = Number.parseInt(req.query.id)
    const formData = req.body
    const parsedFormData = {
      ...formData,
      country: formData.country || null,
      city: formData.city || null,
      category: formData.category || null,
      subCategory: formData.subCategory || null,
    }
    const result = await prisma.post.update({
      where: { id: postId },
      data: parsedFormData,
    })
    res.status(200).json({
      data: result,
      message: `Post "${result.title}" actualizado exitosamente`,
    })
  }
}
