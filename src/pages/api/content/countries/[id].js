// import { db } from "lib/mysql"

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const countryId = Number.parseInt(req.query.id)

    res.status(200).json({ message: `Implementar borrado de país` })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
