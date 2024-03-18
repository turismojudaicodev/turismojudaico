import { db } from 'lib/mysql'
import path from 'path'
import * as fs from 'fs'
import * as XLSX from 'xlsx/xlsx.mjs'

XLSX.set_fs(fs)

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
          // const workbook = parse(data)
          const worksheet = XLSX.utils.json_to_sheet(data)
          const workbook = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Newsletter')

          /* fix headers */
          XLSX.utils.sheet_add_aoa(
            worksheet,
            [['Codigo', 'Mail', 'Nombre', 'Estado']],
            {
              origin: 'A1',
            }
          )

          /* calculate column width */
          const max_width = data.reduce(
            (w, r) => Math.max(w, r.mail.length),
            10
          )
          worksheet['!cols'] = [{ wch: max_width }]

          /* create an XLSX file and try to save to Presidents.xlsx */
          XLSX.writeFile(workbook, 'public/tmp/newsletter.xlsx')

          const filePath = path.resolve('.', 'public/tmp/newsletter.xlsx')

          fs.readFile(filePath, (err, data) => {
            if (err) console.error('ERROR:', err)
            res.setHeader(
              'Content-Type',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            res.setHeader(
              'Content-Disposition',
              'attachment; filename=exportedData.xlsx'
            )
            res.send(data)
            return resolve()
          })
        }
      )
    })
  } else {
    return res.status(403).json({ error: 'Method not allowed' })
  }
}
