import Link from 'next/link'
import styles from './TourCard.module.css'
import { setImageSrc } from '../../../helpers'

export default function TourCard({ tour, locale }) {
  if (!tour) return null

  // 1. Título: Usa nombre o nombre_en según el idioma
  const title = locale === 'en' ? tour.nombre_en : tour.nombre
  
  // 2. Descripción: Usamos descripcioncorta (mucho más breve y limpia)
  const rawDescription = locale === 'en' ? tour.descripcioncorta_en : tour.descripcioncorta
  const cleanDescription = rawDescription ? rawDescription.replace(/(<([^>]+)>)/gi, "") : 'Sin descripción.'
  
  // 3. ID de la base de datos
  const id = tour.codigo || ''
  
  // 4. Imagen: Usamos imagen1 (¡Aquí estaba el error de la imagen default!)
  const imagePath = setImageSrc(tour.imagen1, 'citytours')

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img 
          src={imagePath} 
          alt={`Imagen de ${title}`} 
          className={styles.image} 
          loading="lazy"
        />
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{cleanDescription}</p>
      
        <div className={styles.footer}>
          <Link href={`/tour/${id}`} className={styles.button}>
            {locale === 'en' ? 'Book now' : 'Reservar'}
          </Link>
        </div>
      </div>
    </div>
  )
}