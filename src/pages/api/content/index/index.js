export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { url, name, publicId, section, description } = req.body
    if (!url || !name)
      return res
        .status(400)
        .json({ error: 'Falta el título o url de la imágen' })

    res.status(201).json({
      message: `Imagen "..." agregado correctamente.`,
      data: result,
    })
  }
}
