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

          const workbook = XLSX.utils.book_new()
          const worksheet = XLSX.utils.json_to_sheet(data)

          // Add headers
          XLSX.utils.sheet_add_aoa(
            worksheet,
            [['Codigo', 'Mail', 'Nombre', 'Estado']],
            {
              origin: 'A1',
            }
          )

          // Set column width
          const max_width = data.reduce(
            (w, r) => Math.max(w, r.mail.length),
            10
          )
          worksheet['!cols'] = [{ wch: max_width }]

          // Append the worksheet to the workbook
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Newsletter')

          // Write the workbook to a file
          const filePath = path.resolve('.', 'public/tmp/newsletter.xlsx')
          XLSX.writeFile(workbook, filePath)

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
        }
      )
    })
  } else {
    return res.status(403).json({ error: 'Method not allowed' })
  }
}
