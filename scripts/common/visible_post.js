'use strict'

module.exports = (post, siteConfig, themeConfig) => {
  if (themeConfig.respect_index_exclude_tags === false) return true
  const configured = siteConfig.index_generator && siteConfig.index_generator.exclude_tags
  const excluded = Array.isArray(configured) ? configured : configured ? [configured] : []
  if (!excluded.length || !post.tags) return true
  const tags = Array.isArray(post.tags) ? post.tags : post.tags.data || post.tags.toArray()
  return !tags.some(tag => excluded.includes(typeof tag === 'string' ? tag : tag.name || tag.slug))
}
