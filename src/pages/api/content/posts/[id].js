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
      countryId: parseInt(formData.countryId) || undefined,
      cityId: parseInt(formData.cityId) || undefined,
      categoryId: parseInt(formData.categoryId) || undefined,
      subCategoryId: parseInt(formData.subCategoryId) || undefined,
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
