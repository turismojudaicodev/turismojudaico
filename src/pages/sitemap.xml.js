import { getToursIds } from 'lib/sitemap'

export default function Sitemap() {
  return null
}

export const getServerSideProps = async (ctx) => {
  ctx.res.setHeader('Content-Type', 'text/xml')
  const xml = await generateSitemap()
  ctx.res.write(xml)
  ctx.res.end()

  return {
    props: {},
  }
}

async function generateSitemap() {
  const toursIds = await getToursIds()

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://turismojudaico.com</loc>
      <lastmod>2023-11-25</lastmod>
    </url>
    <url>
      <loc>https://turismojudaico.com/about</loc>
      <lastmod>2023-11-25</lastmod>
    </url>
    <url>
      <loc>https://turismojudaico.com/tours</loc>
      <lastmod>2023-11-25</lastmod>
    </url>
    ${toursIds
      .map(
        (tour) =>
          `<url>
          <loc>${`https://turismojudaico.com/tours/${tour.codigo}`}</loc>
          <lastmod>${formatDate(new Date())}</lastmod>
        </url>`
      )
      .join('')}
    <url>
      <loc>https://turismojudaico.com/audioguides</loc>
      <lastmod>2023-11-25</lastmod>
    </url>
    <url>
      <loc>https://turismojudaico.com/posts</loc>
      <lastmod>2023-11-25</lastmod>
    </url>
    <url>
      <loc>https://turismojudaico.com/blogs</loc>
      <lastmod>2023-11-25</lastmod>
    </url>
    <url>
      <loc>https://turismojudaico.com/contact</loc>
      <lastmod>2023-11-25</lastmod>
    </url>
    <url>
      <loc>https://turismojudaico.com/newsletter</loc>
      <lastmod>2023-11-25</lastmod>
    </url>
  </urlset>`
}

function formatDate(date) {
  const year = date.getFullYear()

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  const formattedDate = `${year}-${month}-${day}`

  return formattedDate
}
