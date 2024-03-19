import { db } from 'lib/mysql'
import path from 'path'
import * as fs from 'fs'
import exceljs from 'exceljs'

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

          const workbook = new exceljs.Workbook()
          const worksheet = workbook.addWorksheet('Newsletter')

          // Add headers
          worksheet.addRow(['Codigo', 'Mail', 'Nombre', 'Estado'])

          // Add data
          data.forEach((row) => {
            worksheet.addRow([row.codigo, row.mail, row.nombre, row.estado])
          })

          // Set column widths
          worksheet.columns.forEach((column) => {
            let maxLength = 0
            column.eachCell({ includeEmpty: true }, (cell) => {
              const length = cell.value ? cell.value.toString().length : 10
              if (length > maxLength) {
                maxLength = length
              }
            })
            column.width = maxLength < 10 ? 10 : maxLength
          })

          // Save the workbook to a file
          const filePath = path.resolve('.', 'public/tmp/newsletter.xlsx')
          workbook.xlsx
            .writeFile(filePath)
            .then(() => {
              // Send the file to the client
              fs.readFile(filePath, (err, data) => {
                if (err) {
                  console.error('ERROR:', err)
                  res
                    .status(500)
                    .json({ error: 'Error del servidor al enviar el archivo' })
                } else {
                  res.setHeader(
                    'Content-Type',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                  )
                  res.setHeader(
                    'Content-Disposition',
                    'attachment; filename=exportedData.xlsx'
                  )
                  res.send(data)
                }
                return resolve()
              })
            })
            .catch((error) => {
              console.error('ERROR:', error)
              res
                .status(500)
                .json({ error: 'Error del servidor al guardar el archivo' })
              return resolve()
            })
        }
      )
    })
  } else {
    return res.status(403).json({ error: 'Method not allowed' })
  }
}
