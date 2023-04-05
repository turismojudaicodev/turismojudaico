import { prisma } from 'lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name } = req.body
    if (!name)
      return res
        .status(400)
        .json({ error: 'No se puede agregar una categoría sin nombre' })
    const result = await prisma.category.create({ data: { name } })
    res
      .status(201)
      .json({
        message: `Categoría ${result.name} agregada correctamente`,
        data: result,
      })
  }
}
