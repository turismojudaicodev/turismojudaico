import { prisma } from 'lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { name, englishName } = req.body
      if (!name || !englishName)
        return res
          .status(400)
          .json({ error: 'No se puede agregar una categoría sin nombre' })
      const result = await prisma.category.create({ data: req.body })
      res.status(201).json({
        message: `Categoría ${result.name} agregada correctamente`,
        data: result,
      })
    } catch (error) {
      res
        .status(500)
        .json({ error: 'Error al crear categoría, verificar si ya existe' })
    }
  }
}
