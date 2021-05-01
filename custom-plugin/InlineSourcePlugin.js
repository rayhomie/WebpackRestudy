const HtmlWebpackPlugin = require('html-webpack-plugin')

/**
 * 首先明确需求：
 * 常规的操作是使用html-webpack-plugin将打包好的js文件以外链src的形式导入html，css文件也是使用Link外链的形式去导入；
 * 而我们现在的需求是要把打包好的js文件内容和css文件内容直接以script和style标签的形式插到html中。
 */
class InlineSourcePlugin {
  constructor({ match }) {
    //需要传入一个正则，判断需要内联的文件类型
    this.regex = match
  }
  apply(compiler) {
    //需要使用到HtmlWebpackPlugin的钩子api对HtmlWebpackPlugin执行过程进行处理。
    //1.首先把webpack执行上下文compilation暴露给HtmlWebpackPlugin使用
    compiler.hooks.compilation.tap('InlineSourcePlugin', (compilation) => {
      //2.使用HtmlWebpackPlugin提供的hooks api进行处理
      //https://github.com/jantimon/html-webpack-plugin#events
      //此时我们用到的是alterAssetTagGroups（修改插入标签组到html的时候的钩子）
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
        'alterPlugin',
        (data, end) => {
          // console.log(data)//打印出来的重要内容是，将要经HtmlWebpackPlugin处理插入html的标签信息
          //需要写一个方法来处理标签并返回处理结果
          data = this.processTags(data, compilation)
          //成功之后把处理结果，以回调的方式返回去
          end(null, data)
        }
      )
    })
  }
  //外链资源的标签处理成内联的形式（标签+内容）
  processTags(data, compilation) {
    let headTags = []
    let bodyTags = []
    //需要将要处理的项的记过分别存到数组中，最后一起返回
    data.headTags.forEach(item => {
      headTags.push(this.handleTag(item, compilation))
    })
    data.bodyTags.forEach(item => {
      bodyTags.push(this.handleTag(item, compilation))
    })
    return { ...data, headTags, bodyTags }//将处理结果返回
  }
  //正式处理标签
  handleTag(tag, compilation) {
    /*console.log(tag)//打印一下即将插入的标签对象，然后就可以开始安找自己的需求进行处理。
    {
      tagName: 'script',
      voidTag: false,
      meta: { plugin: 'html-webpack-plugin' },
      attributes: { defer: true, src: 'index_d187911761f8039b458f.bundle.js' }
    }
    {
      tagName: 'link',
      voidTag: true,
      meta: { plugin: 'html-webpack-plugin' },
      attributes: { href: 'index.70ae7073.css', rel: 'stylesheet' }
    }*/
    let newTag = { ...tag };
    let url;
    if (tag.tagName === 'link' && this.regex.test(tag.attributes.href)) {
      //处理外链文件是.css结尾的link标签
      newTag = {
        tagName: 'style',
        voidTag: false,
        attributes: { type: 'text/css' }
      }
      url = tag.attributes.href
      if (url) {
        //使用compilation上下文的资源对象获取打包好的文件，然后写入到style标签的innerHTML属性上
        newTag.innerHTML = compilation.assets[url].source()
        delete compilation.assets[url]//将原来将要打包生成的文件删除掉，因为内容已经放到了html的标签中
      }
    }

    if (tag.tagName === 'script' && this.regex.test(tag.attributes.src)) {
      //处理外链文件是.js结尾的script标签
      newTag = {
        tagName: 'script',
        voidTag: false,
        attributes: { type: 'application/javascript' }
      }
      url = tag.attributes.src
      if (url) {
        //使用compilation上下文的资源对象获取打包好的文件，然后写入到script标签的innerHTML属性上
        newTag.innerHTML = compilation.assets[url].source()
        delete compilation.assets[url]//将原来将要打包生成的文件删除掉，因为内容已经放到了html的标签中
      }
    }
    return newTag//返回修改后的新标签
  }
}

module.exports = InlineSourcePlugin