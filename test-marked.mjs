import { Marked } from './node_modules/marked/lib/marked.esm.js'

const API_BASE = 'https://note-api.haotian.my.id'
const markedInstance = new Marked()
markedInstance.use({
  renderer: {
    image({ href, title, text }) {
      const src = href?.startsWith('/uploads/') ? `${API_BASE}${href}` : (href || '')
      const titleAttr = title ? ` title="${title}"` : ''
      return `<img src="${src}" alt="${text || ''}"${titleAttr} style="max-width:100%;border-radius:12px;margin:1rem 0;display:block;" />`
    }
  }
})

function encodeMarkdownImages(content) {
  if (!content) return ''
  return content.replace(/!\[([^\]]*)\]\((.+?\.(?:png|jpg|jpeg|gif|webp|svg|bmp))(\s+["'].*?["'])?\)/gi, (match, alt, url, title) => {
    const encodedUrl = url.replace(/ /g, '%20')
    const titleStr = title || ''
    return `![${alt}](${encodedUrl}${titleStr})`
  })
}

function parseMarkdown(content) {
  const processed = encodeMarkdownImages(content)
  return markedInstance.parse(processed, { async: false })
}

const input = 'Here is a post with an image: ![image](/uploads/1779777122400-650881150-Screenshot (5).png) and another text.'
const out = parseMarkdown(input)
console.log('Result HTML:', out)
