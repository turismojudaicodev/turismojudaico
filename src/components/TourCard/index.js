import { setImageSrc, fixUrl } from 'helpers'
// components
import Link from 'next/link'
import Image from 'next/image'
// styles
import styles from './TourCard.module.css'

export function TourCard({ tour, locale = 'es' }) {
  return (
    <div className={styles.card}>
      <Link
        href={`/tour/${tour.codigo}/${
          locale === 'es' ? fixUrl(tour.nombre) : fixUrl(tour.nombre_en)
        }`}
        className={styles.imgContainer}
      >
        <Image
          src={setImageSrc(tour.imagen1, 'citytours')}
          alt={tour.imagen1}
          sizes="(max-width: 500px) 100vw, 300px"
          fill
        />
      </Link>
      <div className={styles.text}>
        <Link
          href={`/tour/${tour.codigo}/${
            locale === 'es' ? fixUrl(tour.nombre) : fixUrl(tour.nombre_en)
          }`}
        >
          <h3>{locale === 'es' ? tour.nombre : tour.nombre_en}</h3>
        </Link>
        <p>
          {locale === 'es' ? tour.descripcioncorta : tour.descripcioncorta_en}
        </p>
      </div>
    </div>
  )
}
