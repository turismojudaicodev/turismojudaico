import Image from 'next/image'

export default function StrapiImage({ image }) {
  if (!image || !image.data)
    return <Image src="/images/logo.png" fill alt="Default image" />

  return <div>StrapiImage</div>
  return (
    <Image
      src={`http://localhost:1337${image.data.attributes.url}`}
      fill
      alt={image.data.attributes.alternativeText}
    />
  )
}
