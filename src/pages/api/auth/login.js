// import bcrypt from 'bcrypt'
// import { prisma } from 'lib/prisma'

// export default async function handler(req, res) {
//   if (req.method !== 'POST')
//     return res.status(405).json({ error: 'Method not allowed' })

//   console.log('request', req.cookies)
//   const { username, password } = req.body

//   if (!username || !password)
//     return res
//       .status(400)
//       .json({ error: 'Both username and password must be provided' })

//   try {
//     const user = await prisma.user.findUnique({ where: { username } })

//     if (!user)
//       return res.status(400).json({ error: 'Invalid username or password' })

//     const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

//     if (!isPasswordValid)
//       return res.status(400).json({ error: 'Invalid username or password' })

//     delete user.passwordHash

//     res.status(200).json({ data: user })
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({ error: 'Internal server error' })
//   }
// }
