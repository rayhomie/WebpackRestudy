//代码编写babel转换
const babel = require('@babel/core')
//获取webpack配置中的传参
const loaderUtils = require('loader-utils')
//用于验证loader配置中传的option的合法性(类似于mongoose)
const validateOptions = require('schema-utils')

function babel_loader(source) {//this-->loaderContext（这里是使用bind去执行的这个loader）
  let options = loaderUtils.getOptions(this)//获取webpack配置loader时的options配置
  /* 验证传参合法性
   let schema = { type:'object',
               properties:{
                 text:{ type:'string' },
                 filename:{ type:'string' }
               }}
  validateOptions(schema,options,'babel-loader')
*/
  let cb = this.async()//调用cb函数用来结束当前loader执行
  babel.transform(source, {//异步操作
    ...options,
    sourceMap: true,//开启sourcemap
    filename: this.resourcePath.split('/').pop()//给sourcemap对应文件名
  }, (err, res) => {
    cb(err, res.code, res.map)//异步结束
  })
}

module.exports = babel_loader