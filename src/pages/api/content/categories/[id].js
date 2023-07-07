import { prisma } from 'lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const categoryId = Number(req.query.id)
    const result = await prisma.category.delete({
      where: {
        id: categoryId,
      },
    })
    res
      .status(200)
      .json({ message: `Categoría ${result.name} borrada exitosamente` })
  }
}
