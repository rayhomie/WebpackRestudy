class FileListPlugin {
  constructor({ filename }) {
    this.filename = filename
  }
  apply(compiler) {//webpack会调用apply
    compiler.hooks.emit.tap(
      'FileListPlugin',
      (compilation) => {
        //我们需要使用assets资源对象获取打包好的文件明细
        const assets = compilation.assets
        let content = `## 文件名    资源大小\n`
        Object.entries(assets).forEach(([filename, statObj]) => {
          //获取文件名和对应文件的大小
          content += `- ${filename}    ${statObj.size()}\n`
        })
        //这样使用source和size就可以写入内容到相应文件
        assets[this.filename] = {
          source() { return content },
          size() { return content.length }
        }
      })
  }
}
module.exports = FileListPlugin