const path = require('path')

//生成一个html模板
const HtmlWebpackPlugin = require('html-webpack-plugin')
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
    filename: '[name]_[hash].bundle.js',//[name]对应的是entry中的名字
    path: path.join(__dirname, 'dist')//打包到的文件夹
  },
  plugins: [//使用插件
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          // 配置项在这里
        }
      },
    },
    {
      test: /\.(jpg|jpeg|png|gif)$/,
      exclude: /node_modules/,
      use: {
        loader: 'file-loader',
        options: {
          // 配置项在这里
          name: '[name]_[hash].[ext]',//使用原先的文件名和后缀名
          outputPath: 'images/'//（匹配到的静态图片放到dist目录的imges下）
        }
      },
    }]
  }
}