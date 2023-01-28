export async function getBlogs() {
  const res = await fetch('http://localhost:1337/api/blogs')
  const data = await res.json()

  return data
}

export async function getBlog(id) {
  const res = await fetch(`http://localhost:1337/api/blogs/${id}`)
  const data = await res.json()

  return data
}
