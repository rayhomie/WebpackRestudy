class AsyncPlugin {
  apply(compiler) {//compiler.hooks
    //下面是指：异步调用compiler的emit钩子
    compiler.hooks.emit.tapAsync('AsyncPlugin', (compilation, end) => {
      console.log('开始第一次等待~~~~~~~~', new Date());
      setTimeout(() => {
        console.log('第一次等待结束~~~~~~~~', new Date());
        end()
      }, 3000)
    })

    //下面是指：异步promise调用compiler的emit钩子
    compiler.hooks.emit.tapPromise('AsyncPlugin', (compilation) => {
      return new Promise((resolve, reject) => {
        console.log('开始第二次等待~~~~~~~~', new Date())
        setTimeout(() => {
          console.log('第二次等待结束~~~~~~~~', new Date())
          resolve('')
        }, 3000)
      })
    })
  }
}

module.exports = AsyncPlugin