import { db } from 'lib/mysql'
import path from 'path'
import * as fs from 'fs'
import XLSX from 'xlsx'

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
          const filePath = path.resolve('.', 'public/tmp/newsletter.json')
          fs.writeFile(filePath, jsonData, (err) => {
            if (err) {
              console.error('ERROR:', err)
              res
                .status(500)
                .json({
                  error: 'Error del servidor al guardar el archivo JSON',
                })
              return resolve()
            }

            // Send the file to the client
            fs.readFile(filePath, (err, data) => {
              if (err) {
                console.error('ERROR:', err)
                res
                  .status(500)
                  .json({
                    error: 'Error del servidor al enviar el archivo JSON',
                  })
              } else {
                res.setHeader('Content-Type', 'application/json')
                res.setHeader(
                  'Content-Disposition',
                  'attachment; filename=exportedData.json'
                )
                res.send(data)
              }
              return resolve()
            })
          })
        }
      )
    })
  } else {
    return res.status(403).json({ error: 'Method not allowed' })
  }
}
