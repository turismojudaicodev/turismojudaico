import Link from 'next/link'
import styles from './PostCard.module.css'
import { fixUrl, setImageSrc } from 'helpers'

export function PostCard({ post, locale = 'es' }) {
  return (
    <div className={styles.card}>
      <Link
        href={`/contenido/${post.codigo}/${
          locale === 'es' ? fixUrl(post.nombre) : fixUrl(post.nombre_en)
        }`}
        className={styles.imgContainer}
      >
        <img
          src={setImageSrc(post.imagen1, 'contenidos')}
          alt={post.imagen1 || 'Sin imagen'}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
      </Link>
      <div className={styles.text}>
        <Link
          href={`/contenido/${post.codigo}/${
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
