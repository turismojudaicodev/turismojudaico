import { db } from 'lib/mysql'
import { uploadJSON } from 'lib/cloudinary'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM newsletter ORDER BY codigo ASC',
        async (err, data) => {
          if (err) {
            console.log(err)
            res
              .status(500)
              .json({ error: err.sqlMessage ?? 'Error del servidor' })
            return resolve()
          }

          // Save the data as a JSON file
          const jsonData = JSON.stringify(data)
          const file = await uploadJSON(jsonData)

          console.log({ file })

          res.status(200).json({ data: file })
          return resolve()
        }
      )
    })
  } else {
    return res.status(403).json({ error: 'Method not allowed' })
  }
}
