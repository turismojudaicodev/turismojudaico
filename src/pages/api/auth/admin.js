import bcrypt from 'bcrypt'
import { prisma } from 'lib/prisma'
import { setCookie } from 'cookies-next'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body

    const admin = await prisma.user.findUnique({
      where: { username },
    })
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash)
    if (!admin || admin.role.toLowerCase() !== 'admin' || !isPasswordValid)
      return res.status(400).json({ error: 'Usuario o contraseña incorrecto' })

    setCookie('user', JSON.stringify(admin), { req, res, maxAge: 60 * 60 * 24 })
    res.status(201).json(admin)
  }
}
