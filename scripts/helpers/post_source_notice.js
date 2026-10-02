'use strict'

const postSourceNotice = require('../common/post_source_notice')

hexo.extend.helper.register('post_source_notice', page => {
  return postSourceNotice(page, hexo.theme.config.post_source_notice, hexo.config.url)
})
