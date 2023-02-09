import { remark } from 'remark'
import html from 'remark-html'

export function formatDate(date) {
  const newDate = new Date(date)

  const options = {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }

  return newDate.toLocaleDateString('es-ES', options)
}

/**
 * Transforms Markdown string into HTML string
 * @param {String} content Markdown content to format
 * @returns {String} HTML formatted content
 */
export async function formatMarkDown(content) {
  if (!content) throw new Error('Content must be provided')

  const processedContent = await remark().use(html).process(content)
  const contentHtml = processedContent.toString()

  return contentHtml
}
