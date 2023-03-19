export default async function handler(req, res) {
  console.log('request')
  const admin = { username: req.body.username, password: req.body.password }
  return res.status(200).json(admin)
}
