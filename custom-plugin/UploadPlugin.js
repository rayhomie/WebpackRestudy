const path = require('path')
class UploadPlugin {
  constructor(options) {
    this.options = options;
    /*
    一般会去执行注册一些上传相关的sdk。
    */
  }
  apply(compiler) {//compiler是webpack提供的执行上下文，里面有钩子
    compiler.hooks.afterEmit.tapPromise('UploadPlugin', (compilation) => {
      //我们需要去拿到打包好的文件，然后才能去上传
      let assets = compilation.assets
      /*console.log(assets)
        {
          'index.6c0f3869.css': SizeOnlySource { _size: 2045 },
          'index_026f604ab272c4366956.bundle.js': SizeOnlySource { _size: 13811 },
          'index.html': SizeOnlySource { _size: 472 }
        }*/
      let promises = []
      Object.keys(assets).forEach(filename => {
        promises.push(this.Upload(filename))
      })
      //这里使用Promise.all来处理多文件上传
      return Promise.all(promises)
    })
  }
  Upload(filename) {
    return new Promise((resolve, reject) => {
      //拿到打包好的本地文件，然后才能正常去上传
      let localFile = path.resolve(__dirname, '../dist', filename)
      /*
      ...上传oss服务器的代码,这里就主要实现一下，从webpack钩子上下文中拿打包好的文件。
      */
      resolve('upload success!!!')
    })
  }
}
//上传文件之前，我们在webpack.config.js的output项中设置publicPath到cdn就好了。
module.exports = UploadPlugin