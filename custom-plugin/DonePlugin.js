class DonePlugin {
  apply(compiler) {//compiler.hooks
    //下面是指：同步调用compiler的done钩子
    compiler.hooks.done.tap('DonePlugin', (compilation) => {
      console.log(compilation)
      console.log('编译完成~~~~')
    })
  }
}

module.exports = DonePlugin