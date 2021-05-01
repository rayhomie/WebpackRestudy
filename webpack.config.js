const path = require('path')
const webpack = require('webpack')

const DonePlugin = require('./custom-plugin/DonePlugin')
const AsyncPlugin = require('./custom-plugin/AsyncPlugin')
const FileListPlugin = require('./custom-plugin/FileListPlugin')
const InlineSourcePlugin = require('./custom-plugin/InlineSourcePlugin')
const OssOptions = require('./oss.json')
const UploadPlugin = require('./custom-plugin/UploadPlugin')


//生成一个html模板
const HtmlWebpackPlugin = require('html-webpack-plugin')
//启动时清空dist文件夹
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
//单独打包css，不使用style标签，自动使用Link标签
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  entry: {
    index: './src/index.js',//基础配置
    // theory_analysis: './src/theory_analysis.js'//打包优化，dll
    // lazyLoad: './src/lazyLoad.js'//路由懒加载、按需加载
  },
  /*启用sourcemap:
  开发环境最佳实践：eval-cheap-module-source-map
  生产环境最佳实践：cheap-module-source-map（线上发生错误的时候提示更全面）*/
  devtool: 'eval-cheap-module-source-map',
  //配置告诉devServer，打包好的文件该到dist文件夹下去取
  devServer: {
    contentBase: './dist',//在webpack4+该字段也可以用static
    hot: true,//启动热模块更新webpack-dev-server3默认不启动，4+默认启动
    proxy: {//配置反向代理
      '/api': {//只要是遇到域名后面是/api开头的请求都转发到target去
        target: 'http://www.weshineapp.com/',
        pathRewrite: {//将/api开头的，'/api'改成'api'
          '^/api': '/api'
        },
        changeOrigin: true//跨域请求
      }
    }
  },
  mode: 'development',
  output: {
    // publicPath: 'http://cdn.xxx.com/',
    //添加src时，的根路径比如现在就是src='http://cdn.xxx.com/[name].bundle.js'
    filename: '[name]_[hash].bundle.js',
    /*[name]对应的是entry中的名字;这里的'[name]'的规则命名称为占位符。
      也可以使用[ext]、[hash]；来使用占位符。
      这里的hash是根据文件内容来生成hash值（可以用于网络资源请求的缓存）*/
    path: path.join(__dirname, 'dist')//打包到的文件夹
  },
  resolve: {
    extensions: ['.tsx', '.jsx', '.js'],//不需要写后缀名，按顺序去找文件
    alias: {//别名
      '@': path.resolve(__dirname, 'src')
    },
    modules: [path.resolve(__dirname, "./src/"), "node_modules"]
    //告诉 webpack 解析模块时应该搜索的目录，即 require 或 import 模块的时候，只写模块名的时候，到哪里去找，其属性值为数组，因为可配置多个模块搜索路径，其搜索路径必须为绝对路径，
  },
  plugins: [//使用插件
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      cache: false
    }),
    //引用动态链接库的插件(告诉webpack我们用了哪些动态链接库，该怎么使用这些dll)
    new webpack.DllReferencePlugin({//要使用Dll的话还需要单独打包动态链接库
      //需要找到生成的dll动态链接库的manifest映射文件
      manifest: path.resolve(__dirname, 'dll', 'react.manifest.json')
      //manifest: require('./dll/react.manifest.json'),//这样也可以
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[chunkhash:8].css",
      chunkFilename: "[id].css"
    }),
    // new DonePlugin(),
    // new AsyncPlugin(),
    // new FileListPlugin({
    //   filename: 'list.md'
    // }),
    // new InlineSourcePlugin({
    //   /*需要传入一个正则，判断需要修改的标签中外链文件的后缀，
    //   因为也有可能link一些json等文件到html中，
    //   目的是处理外链文件是.js结尾的script标签和外链文件是.css结尾的link标签*/
    //   match: /\.(js|css)/
    // }),
    // new UploadPlugin(
    //   OssOptions
    //   /*格式：{ "region": "oss-cn-chengdu",
    //       "accessKeyId": "xxx",
    //       "accessKeySecret": "xxx",
    //       "bucket": "xxx" } */
    // )
  ],
  resolveLoader: {//配置loader存在的文件夹，默认只有node_modules（自定义loader）
    modules: ['node_modules', path.resolve(__dirname, 'custom-loader')]
  },
  module: {//使用loader
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          // options: { /*配置项在这里*/
          //   presets: [
          //     [
          //       '@babel/preset-env',
          //       {//垫片polyfill（告诉babel我们只需要使用到的ES6+的api的实现，减少没必要的多余代码）
          //         useBuiltIns: 'usage'
          //       }
          //     ]
          //   ]
          // }
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
      /*url-loader和file-loader两者不能同时使用：
        - url-loader内置了file-loader（可以直接安装url-loader使用）
        - 可以设置file-loader的所有配置选项
        - 使用limit属性来限制超过多大的图片，就不使用base64来打包图片
        - 所有推荐使用url-loader（也可以处理css中的background-image:url()图片）*/
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
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        //use的数组里面是从后往前加载，我们需要先解析css代码以及文件之间的依赖关系，再将style标签插入head中
        //写法一：use: ['style-loader', 'css-loader',"postcss-loader"]
        //写法二：从后往前的顺序进行读取：
        use: [
          // { loader: "style-loader" },
          MiniCssExtractPlugin.loader,//单独打包css，不使用style标签，自动使用Link标签
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: '[name][hash:base64:6]'
              },
            }
            //打开cssmodule,启用之后就只能用模块化导入，也可以进行配置，让一些文件不启用模块化
          },
          { loader: "postcss-loader" }]
      },
      {//前提是安装sass预处理器
        test: /\.scss$/,
        exclude: /node_modules/,
        //从后往前的顺序进行读取：
        use: [
          // 'style-loader',
          MiniCssExtractPlugin.loader,//单独打包css，不使用style标签，自动使用Link标签
          'css-loader', 'postcss-loader', 'sass-loader']
      },
      {//前提是安装less预处理器
        test: /\.less$/,
        exclude: /node_modules/,
        //从后往前的顺序进行读取：
        use: [
          //'style-loader',
          MiniCssExtractPlugin.loader,//单独打包css，不使用style标签，自动使用Link标签
          'css-loader', 'postcss-loader', 'less-loader']
      },
      /*需要注意的是：postcss的目的是让css3的属性通过脚本的方式生成厂商前缀的工具，
      使用方式类似于babel，也需要安装相应想要使用的插件，
      在`postcss.config.js`中进行配置，在`packege.json`中有browerslist字段设置。*/
      {//解析加载iconfont需要的文件并打包
        test: /\.(eot|woff|ttf|svg)/,
        include: [path.resolve(__dirname, 'src/font')],//只处理src下的font文件夹
        use: {
          loader: 'file-loader',
          options: { outputPath: 'font/' },//打包到dist下的font文件夹
        }
      }
    ]
  }
}