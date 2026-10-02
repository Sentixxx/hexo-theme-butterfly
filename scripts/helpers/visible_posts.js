'use strict'

const isVisiblePost = require('../common/visible_post')

hexo.extend.helper.register('visible_posts', posts => {
  return posts.filter(post => isVisiblePost(post, hexo.config, hexo.theme.config))
})
