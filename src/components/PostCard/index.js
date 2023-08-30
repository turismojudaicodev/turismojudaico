import Link from 'next/link'
import styles from './PostCard.module.css'
import Image from 'next/image'

export function PostCard({ post, locale = 'es' }) {
  return (
    <div className={styles.card}>
      <Link href={`/posts/${post.codigo}`} className={styles.imgContainer}>
        <Image src={'/images/logo.png'} alt={post.imagen} fill />
        {/* `/${post.imagen}` || */}
      </Link>
      <div className={styles.text}>
        <Link href={`/posts/${post.codigo}`}>
          <h3>{locale === 'es' ? post.nombre : post.nombre_en}</h3>
        </Link>
        <p>{locale === 'es' ? post.texto : post.texto_en}</p>
      </div>
    </div>
  )
}

// export function PostCardSkeleton() {
//   return (
//     <div>
//       <div>

//       </div>
//       <div>
//         <div className={styles.skeleton}></div>
//         <div className={styles.skeleteonTextLines}></div>
//       </div>
//     </div>
//   )
// }
