import Link from 'next/link'
import styles from './PostCard.module.css'
import Image from 'next/image'
import { fixUrl, setImageSrc } from 'helpers'

export function PostCard({ post, locale = 'es' }) {
  return (
    <div className={styles.card}>
      <Link
        href={`/posts/${post.codigo}/${
          locale === 'es' ? fixUrl(post.nombre) : fixUrl(post.nombre_en)
        }`}
        className={styles.imgContainer}
      >
        <Image
          src={setImageSrc(post.imagen1, 'contenidos')}
          alt={post.imagen1 || 'Sin imagen'}
          fill
        />
      </Link>
      <div className={styles.text}>
        <Link
          href={`/posts/${post.codigo}/${
            locale === 'es' ? fixUrl(post.nombre) : fixUrl(post.nombre_en)
          }`}
        >
          <h3>{locale === 'es' ? post.nombre : post.nombre_en}</h3>
        </Link>
        <p>{locale === 'es' ? post.descripcion : post.descripcion_en}</p>
      </div>
    </div>
  )
}
