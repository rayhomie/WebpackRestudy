const path = require('path')

//生成一个html模板
const HtmlWebpackPlugin = require('html-webpack-plugin')
//启动时清空dist文件夹
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: {
    main: './src/index.js',
    // sub: './src/index.js'
  },
  /*启用sourcemap:
  开发环境最佳实践：eval-cheap-module-source-map
  生产环境最佳实践：cheap-module-source-map（线上发生错误的时候提示更全面）*/
  devtool: 'eval-cheap-module-source-map',
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
        use: [{ loader: "style-loader" },
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
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
      },
      {//前提是安装less预处理器
        test: /\.less$/,
        exclude: /node_modules/,
        //从后往前的顺序进行读取：
        use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader']
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