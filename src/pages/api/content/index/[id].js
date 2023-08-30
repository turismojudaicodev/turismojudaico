// import { cld } from 'lib/cloudinaryConfig'

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const staticImageId = parseInt(req.query.id)
    if (!staticImageId)
      return res.status(400).json({ error: 'Id de imagen indefinido' })

    res.status(200).json({
      message: `Algo en index con id ${staticImageId}....... borrado exitosamente`,
    })
  }
}
