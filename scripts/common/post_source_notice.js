'use strict'

module.exports = (page, options, siteUrl) => {
  if (!options || !options.enable || page.source_notice === false) return null

  let url
  try {
    url = new URL(options.base_url || siteUrl)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  // Hexo's post path is relative to the site root. Keep a configured subdirectory
  // even when a path has a leading slash, and never reuse page.permalink's host.
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/${(page.path || '').replace(/^\/+/, '')}`
  url.search = ''
  url.hash = ''

  return {
    href: url.href,
    text: options.text || '',
    linkText: options.link_text || '阅读原文'
  }
}
