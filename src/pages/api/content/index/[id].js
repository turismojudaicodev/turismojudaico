import { prisma } from 'lib/prisma'
import { cld } from 'lib/cloudinaryConfig'

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const staticImageId = parseInt(req.query.id)
    if (!staticImageId)
      return res.status(400).json({ error: 'Id de imagen indefinido' })
    try {
      const imageData = await prisma.staticImage.findUnique({
        where: { id: staticImageId },
      })
      const publicId = imageData.publicId
      const imgDestroyResponse = await cld.v2.uploader.destroy(publicId)
      if (imgDestroyResponse.result === 'not found') {
        return res
          .status(404)
          .json({ error: 'No se encontró la imagen en Cloudinary ' })
      }
      await prisma.staticImage.delete({
        where: { id: staticImageId },
      })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ error: 'Error del servidor' })
    }
    res
      .status(200)
      .json({ message: `Imagen con id ${staticImageId} borrada exitosamente` })
  }
}
