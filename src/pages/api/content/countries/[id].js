import { prisma } from 'lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const countryId = Number.parseInt(req.query.id)
    const result = await prisma.country.delete({
      where: {
        id: countryId,
      },
    })
    res.status(200).json({ message: `${result.name} borrado exitosamente` })
  }
}
