# 重学webpack

https://www.bilibili.com/video/BV12a4y1W76V

## 1】入口出口配置

```js
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
    //publicPath: 'http://cdn.xxx.com',
    //添加src时，的根路径比如现在就是src='http://cdn.xxx.com/[name].bundle.js'
    filename: '[name]_[hash].bundle.js',
    /*[name]对应的是entry中的名字;这里的'[name]'的规则命名称为占位符。
      也可以使用[ext]、[hash]；来使用占位符。这里的hash是根据文件内容来生成hash值（可以用于网络资源请求的缓存）*/
    path: path.join(__dirname, 'dist')//打包到的文件夹
  },
  plugins: [//使用插件
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new CleanWebpackPlugin(),
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
        //写法一：use: ['style-loader', 'css-loader']
        //写法二：从后往前的顺序进行读取：
        use: [{ loader: "style-loader" }, { loader: "css-loader" }]
      },
      {//前提是安装sass预处理器
        test: /\.scss$/,
        exclude: /node_modules/,
        //从后往前的顺序进行读取：
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {//前提是安装less预处理器
        test: /\.less$/,
        exclude: /node_modules/,
        //从后往前的顺序进行读取：
        use: ['style-loader', 'css-loader', 'less-loader']
      }
      
    ]
  }
}
```

## 2】loader

### babel-loader

怎么在webpack中使用babel呢?

①首先安装babel-loader

```bash
npm i babel-loader --save-dev
```

②webpack配置文件中配置loader（module的配置项中）

```js
//写法一：
module: {
  rules: [{
    test: /\.js$/,
    use: 'babel-loader',//这样也可以：loader:'babel-loader'
    exclude: /node_modules/
  }]
}
//写法二：（如果需要配置loader）
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
  }]
}
```

③将babel插件的名字增加到配置文件中 (根目录下创建 .babelrc、.babelrc.js 、babel.config.js或者 package.json 的 `babel` 里面来进行配置)

这里使用的是.babelrc的形式：

```json
{
  "presets": ["@babel/preset-env"]
}
```

④再安装我们我们需要使用的babel插件和预设

这里使用的预设是env预设：

```bash
npm i @babel/preset-env --save-dev
```



### file-loader

```js
module: {//使用loader
    rules: [
      {
        test: /\.(jpg|jpeg|png|gif)$/,
        exclude: /node_modules/,
        use: {
          loader: 'file-loader',
          options: { // 配置项在这里：（一般的打包name规则都支持占位符[]）
            name: '[name]_[hash].[ext]',//使用原先的文件名和后缀名
            outputPath: 'images/'
            //（匹配到的静态图片放到dist目录的imges下）
          }
        },
      }
    ]
  }
```



### url-loader

```js
module: {//使用loader
    rules: [
      {
        test: /\.(jpg|jpeg|png)$/,
        exclude: /node_modules/,
        use: {//使用url-loader，自动把图片转成base64的文件格式
          loader: 'url-loader',
        },
      }
    ]
  }
```

**url-loader**和**file-loader**两者**不能同时使用**：

- url-loader内置了file-loader（可以直接安装url-loader使用）
- 可以设置file-loader的所有配置选项
- 使用limit属性来限制超过多大的图片，就不使用base64来打包图片
- 所有**推荐使用url-loader**（也可以处理css中的`background-image:url()`图片）



### css-loader、style-loader

注意：use的数组里面是**从后往前加载**，我们需要先解析css、再将style标签插入到模板中（使用js插入运行时），所以写法必须是`use:['style-loader','css-loader']`

```js
module: {//使用loader
  rules: [
    {
      test: /\.css$/,
      exclude: /node_modules/,
      //use的数组里面是从后往前加载，我们需要先解析css代码以及文件之间的依赖关系，再将style标签插入head中
      //写法一：use: ['style-loader', 'css-loader']
      //写法二：从后往前的顺序进行读取：
      use: [{ loader: "style-loader" }, { loader: "css-loader" }]
    }
  ]
} 
```



### sass-loader、less-loader、postcss-loader

前提需要安装sass或者less才能使用哦！

```bash
#sass预处理器写样式，使用sass-loader处理.scss文件解析
npm i -D sass sass-loader 
#less预处理器写样式，使用less-loader处理.less文件
npm i -D less less-loader 
#安装
npm i -D postcss postcss-loader
```

[postcss](https://www.postcss.com.cn/)的目的是让css3的属性通过脚本的方式生成厂商前缀的工具，使用方式类似于babel，也需要安装相应想要使用的插件，在`postcss.config.js`中进行配置，在`packege.json`中有browerslist字段设置。

```json
//package.json
{
  "name":"xxx",
  "version":"1.0.0",
  ...
  "browerslist":[
    "> 1%",//兼容市场份额大于1%的浏览器
    "last 2 versions"//并且这些浏览器上两个版本都要去兼容
  ],
  ...
}
  
//postcss.config.js
module.exports = {
  plugins: [
  	require('autoprefixer')
	]
}
```

webpack配置：

```js
module: {//使用loader
  rules: [
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
    } 
  ]
} 
```



### cssModule启用







## 3】plugin

总结一句话就是：插件可以在webpack运行在某个阶段（生命周期）做一些事情。

比如：html-webpack-plugin就是在打包结束的时候，将打包好的js文件引用到指定模板html文件中。

再比如： clean-webpack-plugin就是在刚开始webpack启动的时候，将dist文件夹清空。





