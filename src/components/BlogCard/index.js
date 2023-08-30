import Link from 'next/link'
import styles from './BlogCard.module.css'
import Image from 'next/image'

export function BlogCard({ blog, locale = 'es' }) {
  return (
    <div className={styles.card}>
      <Link href={`/blogs/${blog.codigo}`} className={styles.imgContainer}>
        <Image src={'/images/logo.png'} alt={blog.imagen} fill />
        {/* `/${blog.imagen}` || */}
      </Link>
      <div className={styles.text}>
        <Link href={`/blogs/${blog.codigo}`}>
          <h3>{locale === 'es' ? blog.nombre : blog.nombre_en}</h3>
        </Link>
        <p>{locale === 'es' ? blog.texto : blog.texto_en}</p>
      </div>
    </div>
  )
}

// export function BlogCardSkeleton() {
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
