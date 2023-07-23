import cloudinary from 'cloudinary'

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const cld = cloudinary

export async function uploadImage(image) {
  if (image.size > 0) {
    const fd = new FormData()
    fd.append('file', image)
    fd.append('upload_preset', 'tj_local')
    const data = await fetch(
      'https://api.cloudinary.com/v1_1/paiput/image/upload',
      {
        method: 'POST',
        body: fd,
      }
    ).then((r) => r.json())
    return data.secure_url
  }
  return null
}
