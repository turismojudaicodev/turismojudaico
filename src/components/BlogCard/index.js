import Link from 'next/link'
import styles from './BlogCard.module.css'
import Image from 'next/image'
import { setImageSrc, fixUrl } from 'helpers'

export function BlogCard({ blog, locale = 'es' }) {
  return (
    <div className={styles.card}>
      <Link
        href={`/blogs/${blog.codigo}/${
          locale === 'es' ? fixUrl(blog.nombre) : fixUrl(blog.nombre_en)
        }`}
        className={styles.imgContainer}
      >
        <Image
          src={
            locale === 'es'
              ? setImageSrc(blog.imagen, 'noticias')
              : setImageSrc(blog.imagen_en, 'noticias')
          }
          alt={blog.imagen}
          fill
        />
      </Link>
      <div className={styles.text}>
        <Link
          href={`/blogs/${blog.codigo}/${
            locale === 'es' ? fixUrl(blog.nombre) : fixUrl(blog.nombre_en)
          }`}
        >
          <h3>{locale === 'es' ? blog.nombre : blog.nombre_en}</h3>
        </Link>
        <p>{locale === 'es' ? blog.descripcion : blog.descripcion_en}</p>
      </div>
    </div>
  )
}
