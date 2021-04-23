const path = require('path')

//生成一个html模板
const HtmlWebpackPlugin = require('html-webpack-plugin')
//启动时清空dist文件夹
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: {
    main: './src/index.js',
    sub: './src/index.js'
  },
  mode: 'development',
  output: {
    // publicPath: 'http://cdn.xxx.com',
    //添加src时，的根路径比如现在就是src='http://cdn.xxx.com/[name].bundle.js'
    filename: '[name]_[hash].bundle.js',
    /*[name]对应的是entry中的名字;这里的'[name]'的规则命名称为占位符。
      也可以使用[ext]、[hash]；来使用占位符。
      这里的hash是根据文件内容来生成hash值（可以用于网络资源请求的缓存）*/
    path: path.join(__dirname, 'dist')//打包到的文件夹
  },
  plugins: [//使用插件
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
  module: {//使用loader
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { /*配置项在这里*/ }
        },
      },
      // {
      //   test: /\.(jpg|jpeg|png|gif)$/,
      //   exclude: /node_modules/,
      //   use: {
      //     loader: 'file-loader',
      //     options: { // 配置项在这里
      //       name: '[name]_[hash].[ext]',//使用原先的文件名和后缀名
      //       outputPath: 'images/'//（匹配到的静态图片放到dist目录的imges下）
      //     }
      //   },
      // },
      /*
    url-loader**和file-loader两者不能同时使用：
    - url-loader内置了file-loader（可以直接安装url-loader使用）
    - 可以设置file-loader的所有配置选项
    - 使用limit属性来限制超过多大的图片，就不使用base64来打包图片
    - 所有推荐使用url-loader（也可以处理css中的background-image:url()）*/
      {
        test: /\.(jpg|jpeg|png)$/,
        exclude: /node_modules/,
        use: {//使用url-loader，自动把图片转成base64的文件格式
          loader: 'url-loader',
          options: {
            limit: 100,
            name: '[name]_[hash].[ext]',//使用原先的文件名和后缀名
            outputPath: 'images/'//（匹配到的静态图片放到dist目录的imges下）
          }
        },
      }
    ]
  }
}