// import { prisma } from 'lib/prisma'
// import { hashPassword } from 'lib/users'

// export default async function handler(req, res) {
//   const { username, email, password } = req.body

//   const passwordHash = await hashPassword(password)

//   const newUser = await prisma.user.create({
//     data: {
//       username,
//       email,
//       passwordHash,
//     },
//   })

//   res.status(201).json(newUser)
// }
