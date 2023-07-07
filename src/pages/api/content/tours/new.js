import { prisma } from 'lib/prisma'
import { uploadImage } from 'lib/cloudinary'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { locale, title, description, content, active, image, posts } =
      req.body

    if (!locale || !title || !description || !content)
      return res
        .status(400)
        .json({ error: 'Falta algún dato obligatorio del posts' })

    try {
      if (image) {
        // console.log('image', image)
        // const result = uploadImage(image)
        // console.log('image upload result:', result)
      }

      const result = await prisma.tour.create({
        data: {
          locale,
          title,
          description,
          content,
          active,
        },
      })

      if (posts.length > 0) {
        for (const id of posts) {
          const postRes = await prisma.post.update({
            where: { id: parseInt(id) },
            data: { tourId: result.id },
          })
          // console.log('post res:', postRes)
        }
      }

      res.status(201).json({
        message: `Post ${result.title} creado exitosamente`,
        data: result,
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Error interno' })
    }
  }
}
