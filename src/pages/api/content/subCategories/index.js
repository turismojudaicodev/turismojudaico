import { prisma } from 'lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, englishName, categoryId } = req.body
    if (!name || !categoryId || !englishName)
      return res.status(400).json({
        error:
          'Falta el nombre de la sub categoría o la categoría a la que pertenece',
      })
    const result = await prisma.subCategory.create({
      data: { name, englishName, categoryId: Number.parseInt(categoryId) },
      include: { category: true },
    })
    res.status(201).json({
      message: `Sub categoría ${result.name} agregada correctamente`,
      data: result,
    })
  }
}
