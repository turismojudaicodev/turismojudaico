import cloudinary from 'cloudinary'

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export function uploadImage(file) {
  cloudinary.v2.uploader
    .upload(file, {
      resource_type: 'image',
    })
    .then((result) => console.log('result ->', result))
}

export default cloudinary
