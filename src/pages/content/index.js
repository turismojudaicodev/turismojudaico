import Head from 'next/head'
import Layout from '@/components/Layout'
import utils from '@/styles/utils.module.css'
import { db } from 'lib/db'
import { useState } from 'react'
import styles from '@/styles/Content.module.css'

export async function getStaticProps() {
  const postsQuery =
    'SELECT `p`.*, c.name AS `category`, sc.name AS `sub_ategory` FROM posts p, posts_category_links pcl, posts_sub_category_links pscl, categories c, sub_categories sc WHERE pcl.post_id = p.id AND pscl.post_id = p.id AND pcl.category_id = c.id AND pscl.sub_category_id = sc.id;'

  const [posts, postsFields] = await db.query(postsQuery)

  const categoriesQuery = `
    SELECT c.name AS "category", sc.name AS "sub_category"
    FROM categories c, sub_categories sc, sub_categories_category_links sccl
    WHERE sccl.category_id = c.id AND sccl.sub_category_id = sc.id;
  `

  const [categories, categoriesFields] = await db.query(categoriesQuery)

  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
      categories: JSON.parse(JSON.stringify(categories)),
    },
  }
}

export default function Content({ posts, categories }) {
  const [currentCategory, setCurrentCategory] = useState(null)

  const categoriesNamesRepeated = categories.map(
    (category) => category.category
  )

  const categoriesNames = categoriesNamesRepeated.filter(
    (item, index) => categoriesNamesRepeated.indexOf(item) === index
  )

  // console.log('posts', posts)
  // console.log('categories', categories)
  // console.log('cat names', categoriesNames)

  function handleSubmit(ev) {
    ev.preventDefault()
  }

  function updateCategory(ev) {
    setCurrentCategory(ev.target.value)
  }

  return (
    <>
      <Head>
        <title>Contenido</title>
      </Head>
      <Layout>
        <main className={utils.container}>
          <div>
            <h2>Filtrar</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="text"
                className={utils.input}
                placeholder="Buscar..."
              ></input>
              <div>
                <label htmlFor="country">País</label>
                <select id="country" className={utils.input}>
                  <option></option>
                </select>
              </div>
              <div>
                <label htmlFor="city">Ciudad</label>
                <select id="city" className={utils.input}>
                  <option></option>
                </select>
              </div>
              <div>
                <label htmlFor="category">Categoría</label>
                <select
                  id="category"
                  className={utils.input}
                  onChange={updateCategory}
                >
                  <option value="any">-</option>
                  {categoriesNames.map((category) => (
                    <option value={category} key={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="subCategory">Sub categoría</label>
                <select id="subCategory" className={utils.input}>
                  <option value="any">-</option>
                  {categories
                    .filter((item, index) => item.category === currentCategory)
                    .map((category) => (
                      <option key={category.sub_category}>
                        {category.sub_category}
                      </option>
                    ))}
                </select>
              </div>
              <button className={utils.button} type="submit">
                Buscar
              </button>
            </form>
          </div>
        </main>
      </Layout>
    </>
  )
}
