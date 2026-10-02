const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const pug = require('pug')
const notice = require('../scripts/common/post_source_notice')

const filename = path.join(__dirname, '../layout/post.pug')
// Render the real post layout and its includes without the unrelated site shell.
const render = pug.compile(fs.readFileSync(filename, 'utf8').replace(/^extends .*\r?\n/, ''), { filename })
const options = { enable: true, base_url: 'https://blog.sentixx.top', text: '来自 <原站> & 作者：', link_text: '阅读 <原文>' }

function renderPost (page, settings = options) {
  return render({
    page: { tags: { length: 0 }, ...page },
    theme: {
      noticeOutdate: { enable: false }, post_copyright: { enable: false },
      reward: { enable: false }, share: {}, comments: {}, post_pagination: false
    },
    top_img: '',
    post_source_notice: page => notice(page, settings, 'https://sentixxx.github.io')
  })
}

test('source link uses the canonical host and preserves encoded paths and site subdirectories', () => {
  const page = { path: '/posts/中文%20标题/', permalink: 'https://sentixxx.github.io/wrong/' }
  assert.equal(notice(page, options).href, 'https://blog.sentixx.top/posts/%E4%B8%AD%E6%96%87%20%E6%A0%87%E9%A2%98/')
  for (const base_url of ['https://example.com/blog', 'https://example.com/blog/']) {
    assert.equal(notice({ path: 'posts/example.html' }, { ...options, base_url }).href, 'https://example.com/blog/posts/example.html')
  }
  assert.equal(notice({ path: 'posts/example/' }, { ...options, base_url: '' }, 'https://example.com/').href, 'https://example.com/posts/example/')
})

test('real post layout renders escaped notice outside article content without mutating the post', () => {
  const page = { path: 'posts/a&b/', content: '<p>正文 <strong>内容</strong></p>' }
  const html = renderPost(page)
  assert.match(html, /<aside class="post-source-notice">/)
  assert.match(html, /来自 &lt;原站&gt; &amp; 作者：/)
  assert.match(html, /href="https:\/\/blog\.sentixx\.top\/posts\/a&amp;b\/"/)
  assert.match(html, /阅读 &lt;原文&gt;/)
  assert.match(html, /<\/aside><article class="container post-content" id="article-container"><p>正文 <strong>内容<\/strong><\/p><\/article>/)
  assert.equal(page.content, '<p>正文 <strong>内容</strong></p>')
})

test('default disabled, article opt-out and invalid base URL omit the notice', () => {
  const page = { path: 'posts/example/', content: '<p>正文</p>' }
  for (const settings of [undefined, { ...options, enable: false }, { ...options, base_url: 'javascript:alert(1)' }]) {
    assert.doesNotMatch(renderPost(page, settings || {}), /post-source-notice/)
  }
  assert.doesNotMatch(renderPost({ ...page, source_notice: false }), /post-source-notice/)
})
