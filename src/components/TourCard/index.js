import Link from 'next/link'
import styles from './TourCard.module.css'
import Image from 'next/image'

export function TourCard({ tour, locale = 'es' }) {
  return (
    <div className={styles.card}>
      <Link href={`/tours/${tour.codigo}`} className={styles.imgContainer}>
        <Image src={'/images/logo.png'} alt={tour.imagen1} fill />
      </Link>
      <div className={styles.text}>
        <Link href={`/tours/${tour.codigo}`}>
          <h3>{locale === 'es' ? tour.nombre : tour.nombre_en}</h3>
        </Link>
        <p>
          {locale === 'es' ? tour.descripcioncorta : tour.descripcioncorta_en}
        </p>
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
