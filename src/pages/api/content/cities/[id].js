import { prisma } from 'lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const cityId = Number.parseInt(req.query.id)
    const result = await prisma.city.delete({
      where: {
        id: cityId,
      },
    })
    console.log(result)
    res.status(200).json({ message: `Ciudad borrada exitosamente` })
  }
}
