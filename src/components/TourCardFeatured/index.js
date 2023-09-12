import { setImageSrc } from 'helpers'
// components
import Link from 'next/link'
import Image from 'next/image'
// styles
import styles from './TourCardFeatured.module.css'

export function TourCardFeatured({ tour, locale = 'es' }) {
  return (
    <div className={styles.tour}>
      <Link className={styles.imgContainer} href={`/tours/${tour.codigo}`}>
        <Image
          src={setImageSrc(tour.imagen1, 'citytours')}
          alt={tour.imagen1}
          fill
        />
      </Link>
      <div className={styles.infoContainer}>
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
