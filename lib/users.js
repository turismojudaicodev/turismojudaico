import bcrypt from 'bcrypt'

export async function hashPassword(password) {
  const saltRounds = 10
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    return hashedPassword
  } catch (error) {
    console.log('Error hashing password', error)
  }
}
