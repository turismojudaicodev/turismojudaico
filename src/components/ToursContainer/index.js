// Components
import Link from 'next/link'
import StrapiImage from '../StrapiImage'
// Styles
import styles from './ToursContainer.module.css'

export default function ToursContainer({ tours }) {
  return (
    <div className={styles.toursContainer}>
      {tours.map((tour) => (
        <div className={styles.tour} key={tour.id}>
          <Link className={styles.imgContainer} href={`/tours/${tour.id}`}>
            <StrapiImage image={tour.image} />
          </Link>
          <div className={styles.infoContainer}>
            <Link href={`/tours/${tour.id}`}>
              <h3>{tour.title}</h3>
            </Link>
            <p>{tour.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
