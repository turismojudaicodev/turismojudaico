import { fixUrl, setImageSrc } from 'helpers'
// components
import Link from 'next/link'
// styles
import styles from './TourCardFeatured.module.css'

export function TourCardFeatured({ tour, locale = 'es' }) {
  return (
    <div className={styles.tour}>
      <Link
        className={styles.imgContainer}
        href={`/tour/${tour.codigo}/${
          locale === 'es' ? fixUrl(tour.nombre) : fixUrl(tour.nombre_en)
        }`}
      >
        <img
          src={setImageSrc(tour.imagen1, 'citytours')}
          alt={tour.imagen1}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
      </Link>
      <div className={styles.infoContainer}>
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
