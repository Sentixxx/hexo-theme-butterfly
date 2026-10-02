const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { createRequire } = require('node:module')
const pug = require('pug')
const { escapeHTML } = require('hexo-util')
const isVisiblePost = require('../scripts/common/visible_post')

const siteConfig = { index_generator: { exclude_tags: ['hide'], exclude_categories: ['diary'] } }

test('recommendations follow excluded tag names, with an explicit opt-out and no category exclusion', () => {
  for (const tags of [['hide'], [{ name: 'hide', slug: 'hidden' }], { data: [{ name: 'hide' }] }]) {
    assert.equal(isVisiblePost({ tags }, siteConfig, {}), false)
    assert.equal(isVisiblePost({ tags }, siteConfig, { respect_index_exclude_tags: false }), true)
  }
  assert.equal(isVisiblePost({ tags: ['tech'], categories: ['diary'] }, siteConfig, {}), true)
  assert.equal(isVisiblePost({ tags: ['hide'] }, {}, {}), true)
})

test('rendered related posts exclude hidden entries before the limit and preserve contain covers', () => {
  const helpers = {}
  const filename = path.join(__dirname, '../scripts/helpers/related_post.js')
  const hexo = {
    config: siteConfig,
    theme: { config: { related_post: { limit: 1 } } },
    extend: { helper: { register: (name, helper) => { helpers[name] = helper } } }
  }
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), { hexo, require: createRequire(filename) }, { filename })
  const hidden = { path: 'hidden/', title: 'Hidden', tags: ['hide'], postDesc: 'secret' }
  const visible = { path: 'visible/', title: 'Visible', tags: ['tech'], cover: 'https://example.com/wide.png', cover_type: 'img', cover_fit: 'contain', postDesc: 'summary' }
  const page = { path: 'current/', tags: [{ posts: [hidden, visible] }] }
  const html = helpers.related_posts.call({ _p: key => key, escape_html: escapeHTML, url_for: value => value, date: () => '2026-10-03' }, page)
  assert.doesNotMatch(html, /hidden\/|Hidden|secret/)
  assert.match(html, /href="visible\/"/)
  assert.match(html, /class="cover cover-fit-contain"/)
})

const renderPagination = pug.compileFile(path.join(__dirname, '../layout/includes/pagination.pug'))
const labels = { 'pagination.prev_page': '上一页', 'pagination.next_page': '下一页', 'pagination.prev': '上一篇', 'pagination.next': '下一篇' }
const globals = { escape_html: escapeHTML, _p: key => labels[key], url_for: value => value }

test('pagination passes readable labels to Hexo while hiding decorative icons from screen readers', () => {
  const html = renderPagination({
    ...globals,
    globalPageType: 'home', page: { total: 3 },
    paginator: options => options.prev_text + options.next_text
  })
  assert.match(html, /aria-hidden="true"/)
  assert.match(html, /class="pagination-label">上一页<\/span>/)
  assert.match(html, /class="pagination-label">下一页<\/span>/)
})

test('adjacent-post links name their destination and support an uncropped cover', () => {
  const html = renderPagination({
    ...globals,
    globalPageType: 'post',
    page: { next: { path: 'next/', title: 'A & B', cover_type: 'img', cover: 'wide.png', cover_fit: 'contain', postDesc: 'summary' } },
    theme: { post_pagination: 1, error_img: { post_page: '404.jpg' } }
  })
  assert.match(html, /aria-label="上一篇: A &amp; B"/)
  assert.match(html, /class="cover cover-fit-contain"/)
})
