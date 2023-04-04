import { prisma } from 'lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name } = req.body
    if (!name)
      return res
        .status(400)
        .json({ error: 'No se puede agregar un pais sin nombre' })
    const result = await prisma.country.create({ data: { name } })
    res
      .status(201)
      .json({ message: `${name} agregado correctamente.`, data: result })
  }
}
