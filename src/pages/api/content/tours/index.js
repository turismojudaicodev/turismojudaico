import { prisma } from 'lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { posts } = req.body

    const conditionsObj = {}
    if (posts) conditionsObj.posts = posts

    try {
      const result = await prisma.post.findMany({
        where: {
          title: {
            contains: post,
          },
          ...conditionsObj,
        },
        include: {
          posts: true,
        },
      })
      if (!result)
        return res
          .status(404)
          .json({ error: 'No se encontraron posts con estas características' })
      res.status(200).json({ data: result })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Error interno' })
    }
  }
}
