import { prisma } from 'lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const subCategoryId = Number.parseInt(req.query.id)
    const result = await prisma.subCategory.delete({
      where: {
        id: subCategoryId,
      },
    })
    res
      .status(200)
      .json({ message: `Categoría ${result.name} borrada exitosamente` })
  }
}
