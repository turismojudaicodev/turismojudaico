import { prisma } from 'lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { url, name, publicId, section, description } = req.body
    if (!url || !name)
      return res
        .status(400)
        .json({ error: 'Falta el título o url de la imágen' })

    const result = await prisma.staticImage.create({
      data: { name, url, publicId, section, description },
    })

    res.status(201).json({
      message: `Imagen ${result.name} agregado correctamente.`,
      data: result,
    })
  }
}
