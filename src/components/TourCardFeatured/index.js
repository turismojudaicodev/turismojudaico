import Link from 'next/link'
import Image from 'next/image'
import styles from './TourCardFeatured.module.css'

export function TourCardFeatured({ tour, locale = 'es' }) {
  return (
    <div className={styles.tour}>
      <Link className={styles.imgContainer} href={`/tours/${tour.id}`}>
        <Image src="/images/logo.png" alt={tour.imagen1} fill />
      </Link>
      <div className={styles.infoContainer}>
        <Link href={`/tours/${tour.id}`}>
          <h3>{locale === 'es' ? tour.nombre : tour.nombre_en}</h3>
        </Link>
        <p>
          {locale === 'es' ? tour.descripcioncorta : tour.descripcioncorta_en}
        </p>
      </div>
    </div>
  )
}
