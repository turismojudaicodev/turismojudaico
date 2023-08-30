import bcrypt from 'bcrypt'
import { setCookie } from 'cookies-next'
// import { bd } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body

    // const admin = await prisma.user.findUnique({
    //   where: { username },
    // })
    // const isPasswordValid = await bcrypt.compare(password, admin.passwordHash)
    // if (!admin || admin.role.toLowerCase() !== 'admin' || !isPasswordValid)
    //   return res.status(400).json({ error: 'Usuario o contraseña incorrecto' })
    if (username !== 'admin' || password !== 'admin')
      return res.status(400).json({ error: 'Usuario o contraseña incorrecto' })

    setCookie('user', JSON.stringify({ username, password, role: 'ADMIN' }), {
      req,
      res,
      maxAge: 60 * 60 * 24,
    })
    // setCookie('user', JSON.stringify(admin), { req, res, maxAge: 60 * 60 * 24 })
    // res.status(201).json(admin)
    res.status(201).json({ username, password, role: 'ADMIN' })
  }
}
