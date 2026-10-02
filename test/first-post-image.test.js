const test = require('node:test')
const assert = require('node:assert/strict')
const select = require('../scripts/common/first_post_image')

test('body first image takes precedence over fixed random fallback', () => {
  const data = { cover_auto: true, cover: 'https://x/random.jpg', top_img: '', content: '<p><img src="https://x/body.png?a=1&amp;b=2"></p>' }
  select(data)
  assert.equal(data.cover, 'https://x/body.png?a=1&b=2')
  assert.equal(data.top_img, '') // Butterfly naturally falls back to cover.
})

test('source fallback survives cached generation and removal of body image', () => {
  const data = { cover_auto: true, raw: '---\ncover: https://x/random.jpg\n---\ntext', cover: 'https://x/old-body.png', content: 'no image' }
  select(data)
  assert.equal(data.cover, 'https://x/random.jpg')
})

test('manual opt out, disabled cover and manual banner are preserved', () => {
  for (const data of [{ cover_auto: false, cover: 'manual' }, { cover_auto: true, cover: false }]) {
    const before = data.cover
    data.content = '<img src="/body.jpg">'
    select(data)
    assert.equal(data.cover, before)
  }
  const data = { cover_auto: true, top_img: '/banner.jpg', content: '<img src="/body.jpg">' }
  select(data)
  assert.equal(data.top_img, '/banner.jpg')
})

test('ignores code, comments and data-src; resolves relative first-image paths', () => {
  const data = { cover_auto: true, path: 'posts/example/index.html', content: '<!-- <img src="wrong"> --><code>&lt;img src="wrong"&gt;</code><img data-src="wrong" src="photo.png">' }
  select(data)
  assert.equal(data.cover, '/posts/example/photo.png')
  data.path = 'posts/example/'
  select(data)
  assert.equal(data.cover, '/posts/example/photo.png')
})
