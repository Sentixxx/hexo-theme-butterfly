'use strict'

const { posix } = require('path')
const { unescapeHTML } = require('hexo-util')
const frontMatter = require('hexo-front-matter')

module.exports = data => {
  if (data.cover_auto !== true || data.cover === false) return

  // Hexo has already rendered Markdown, including Obsidian embeds. Escaped code
  // samples are not img elements; comments must not become covers either.
  const html = String(data.content || '').replace(/<!--[\s\S]*?-->/g, '')
  const tag = html.match(/<img\b[^>]*>/i)?.[0]
  const src = tag?.match(/\s+src\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
  let image = src && unescapeHTML(src[1] || src[2] || src[3] || '')

  if (image && !/^(?:https?:\/\/|\/|data:image\/)/i.test(image)) {
    const postPath = data.path || ''
    const directory = postPath.endsWith('/') ? postPath : posix.dirname(postPath)
    image = '/' + posix.normalize(posix.join(directory, image))
  }

  // Read the unchanged source front matter: data.cover may already contain a
  // generated first-image cover from a previous cached/watch build.
  const fallback = data.raw ? frontMatter.parse(data.raw).cover : data.cover
  data.cover = image || fallback
}
