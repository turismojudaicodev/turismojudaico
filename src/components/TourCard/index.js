import { setImageSrc } from 'helpers'
// components
import Link from 'next/link'
import Image from 'next/image'
// styles
import styles from './TourCard.module.css'

export function TourCard({ tour, locale = 'es' }) {
  return (
    <div className={styles.card}>
      <Link href={`/tours/${tour.codigo}`} className={styles.imgContainer}>
        <Image
          src={setImageSrc(tour.imagen1, 'citytours')}
          alt={tour.imagen1}
          fill
        />
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
