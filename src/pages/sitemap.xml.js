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
  // const pages = getPages()

  // return `<?xml version="1.0" encoding="UTF-8"?>
  // <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  //   ${pages
  //     .map(
  //       (page) =>
  //         `<url>
  //         <loc>${page.url}</loc>
  //         <lastmod>${page.updated_at + 'formatear correctamente'}</lastmod>
  //       </url>`
  //     )
  //     .join('')}
  //   <url>
  //     <loc>https://turismojudaico.com</loc>
  //     <lastmod>2022-06-04</lastmod>
  //   </url>
  // </urlset>`

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
    <url>
      <loc>https://turismojudaico.com/tours/2</loc>
      <lastmod>2023-11-25</lastmod>
    </url>
    <url>
      <loc>https://turismojudaico.com/tours/3</loc>
      <lastmod>2023-11-25</lastmod>
    </url>
    <url>
      <loc>https://turismojudaico.com/tours/4</loc>
      <lastmod>2023-11-25</lastmod>
    </url>
    <url>
      <loc>https://turismojudaico.com/tours/6</loc>
      <lastmod>2023-11-25</lastmod>
    </url>
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

function getPages() {
  // hacer
}
