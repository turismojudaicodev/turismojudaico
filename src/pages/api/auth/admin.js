import bcrypt from 'bcrypt'
import { prisma } from 'lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body

    const admin = await prisma.user.findUnique({
      where: { username },
    })
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash)
    if (!admin || admin.role !== 'admin' || !isPasswordValid)
      return res.status(400).json({ error: 'Usuario o contraseña incorrecto' })
    res.status(201).json(admin)
  }
}
