# 重学webpack

## 1】入口出口配置

```js
const path = require('path')
const webpack = require('webpack')

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
  devtool:'eval-source-map',//开启SourceMap代码映射//默认是eval
  //配置告诉devServer，打包好的文件该到dist文件夹下去取
  devServer: { 
    contentBase: './dist',//在webpack4+该字段也可以用static
    hot:true,//启动热模块更新webpack-dev-server3默认不启动，4+默认启动
    proxy:{//配置反向代理
      '/api':{//只要是遇到域名后面是/api开头的请求都转发到target去
        target:'http://www.weshineapp.com/',  
        pathRewrite: {//将/api开头的，'/api'改成'api'
          '^/api': '/api'
        },
        changeOrigin:true//跨域请求
      }
    }
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
  resolve: {
    extensions: ['.tsx', '.jsx', '.js'],//不需要写后缀名，按顺序去找文件
    alias: {//别名
      '@': path.resolve(__dirname, 'src')
    },
    modules: [path.resolve(__dirname, "./src/"), "node_modules"]
    //告诉 webpack 解析模块时应该搜索的目录，即 require 或 import 模块的时候，只写模块名的时候，到哪里去找，其属性值为数组，因为可配置多个模块搜索路径，其搜索路径必须为绝对路径，
  },
  plugins: [//使用插件
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new CleanWebpackPlugin(),
    //引用动态链接库的插件(告诉webpack我们用了哪些动态链接库，该怎么使用这些dll)
    new webpack.DllReferencePlugin({//要使用Dll的话还需要单独打包动态链接库
      //需要找到生成的dll动态链接库的manifest映射文件
      manifest: path.resolve(__dirname, 'dll', 'react.manifest.json')
      //manifest: require('./dll/react.manifest.json'),//这样也可以
    })
  ],  
  resolveLoader: {//配置loader存在的文件夹，默认只有node_modules（自定义loader）
    modules: ['node_modules', path.resolve(__dirname, 'custom-loader')]
  },
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
        use: [
        //  { loader: "style-loader" },
          MiniCssExtractPlugin.loader,//单独打包css，不使用style标签，自动使用Link标签
          { loader: "css-loader",
           options:{//开启cssmodule
             modules: { localIdentName: '[name][hash:base64:6]' }
           } 
          },
          { loader: "postcss-loader" }
        ]
      },
      {//前提是安装sass预处理器
        test: /\.scss$/,
        exclude: /node_modules/,
        //从后往前的顺序进行读取：
        use: [
          //'style-loader',
          MiniCssExtractPlugin.loader,//单独打包css，不使用style标签，自动使用Link标签
          'css-loader', 'sass-loader','postcss-loader']
      },
      {//前提是安装less预处理器
        test: /\.less$/,
        exclude: /node_modules/,
        //从后往前的顺序进行读取：
        use: [
          //'style-loader',
          MiniCssExtractPlugin.loader,//单独打包css，不使用style标签，自动使用Link标签
          'css-loader', 'less-loader','postcss-loader']
      },
      /*需要注意的是：postcss的目的是让css3的属性通过脚本的方式生成厂商前缀的工具，
      使用方式类似于babel，也需要安装相应想要使用的插件，
      在`postcss.config.js`中进行配置，在`packege.json`中有browerslist字段设置。*/
      {//解析加载iconfont需要的文件并打包
        test: /\.(eot|woff|ttf|svg)/,
        include: [path.resolve(__dirname, 'src/font')],
        //只处理src下的font文件夹
        use: {
          loader: 'file-loader',
          options: { outputPath: 'font/' },//打包到dist下的font文件夹
        }
      }
    ]
  }
}
```

## 2】loader

loader的执行顺序是**从下到上，从右到左**。

### babel-loader

##### 怎么在webpack中使用babel呢?

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

##### 使用babel-polyfill（垫片）补充ES6代码的实现

低版本的浏览器没有新版本的API，如：promise、Array.from、Map等。所以我们需要使用babel-polyfill来在代码中补充这些缺少的api的实现。

①安装`npm i --save @babel/polyfill`，它不是开发时依赖，是生产环境也需要的依赖。

②在项目入口文件中导入垫片

```js
//index.js
import '@babel/polyfill'

const promiseArray = [
  new Promise(()=>{}),
  new Promise(()=>{})
]

promiseArray.map(promise=>promise)
```

③在presets的设置中进行配置（告诉babel我们只需要使用到的ES6+的api的实现，减少没必要的多余代码）

```js
//.babelrc
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage"
      }
    ]
  ]
}


//webpack.config.js
{
  test: /\.js$/,
    exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
          options: { /*配置项在这里*/
            presets: [
              [
                '@babel/preset-env',
                {//垫片polyfill（告诉babel我们只需要使用到的ES6+的api的实现，减少没必要的多余代码）
                  useBuiltIns: 'usage'
                }
              ]
            ]
          }
        },
      },
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

需要注意的是**如果启用了cssmodule的话就不能使用普通的方式进行导入css**，因为css文件打包后类名变成了hash值，不能用我们自己定义的类名去找样式。

如果不启用cssmodule的话，`import './index.css'`是全局的引入，在全局都生效。

```js
module: {//使用loader
  rules: [
    {
      test: /\.css$/,
      exclude:[path.resolve(__dirname, '..', 'node_modules')],
      use: [
        { loader: "style-loader" },
        {
          loader: "css-loader",
        	options:{
            modules:true//css-module打开。
          }
        }
      ]
    },
    //此时我们的配置是遇到.css文件就回去开启,而引入的npm包的样式还没有处理。所以还需要一个配置：单独处理node_module内的css文件

    { 
      test: /\.css$/,
      use: ['style-loader','css-loader','postcss-loader'],
    include:[path.resolve(__dirname, '..', 'node_modules')]
}
  ]
}
```

然后再每个模块中就可以使用cssmodule的语法了：

```js
//index.css
.avatar{
  width:10;
  height:10;
}

//index.js
import styles from './index.css
console.log(styles)//{avatar: "_1ofLYuuFNEe_WYUYkaG3VO"}
//import './index.css'//启用之后就不能这样导入，因为css文件打包后类名变成了hash值，不能用.avatar找到相应类名。
const App = document.getElementById('app')
const image = new Image()
image.src = avatar
image.className += styles.avatar//只能由这种方式去使用类名
App.appendChild(image)
```

#### [支持`css module`模式和普通模式混用](https://www.cnblogs.com/walls/p/9153555.html)

1.用文件名区分两种模式

- `*.global.css` 普通模式
- `*.css` css module模式

这里统一用 `global` 关键词进行识别。

2.用正则表达式匹配文件

```javascript
// css module
{ 
    test: new RegExp(`^(?!.*\\.global).*\\.css`),
    use: [
        {
            loader: 'style-loader'
        }，
        {
            loader: 'css-loader',
            options: {
                modules: {  localIdentName: '[hash:base64:6]' },
              }
        },
        {
            loader: 'postcss-loader'
        }
    ],
    exclude:[path.resolve(__dirname, '..', 'node_modules')]
}

// 普通模式
{ 
    test: new RegExp(`^(.*\\.global).*\\.css`),
    use: [
        {
            loader: 'style-loader'
        }，
        {
            loader: 'css-loader',
        },
        {
            loader: 'postcss-loader'
        }
    ],
    exclude:[path.resolve(__dirname, '..', 'node_modules')]
}
```



### file-loader打包字体图标

①首先我们到iconfont去下载我们需要的字体和图标源文件。在把他们保存到前端项目的静态资源文件夹font中。

其中有个css文件如下：

```css
/*iconfont配置*/
@font-face {
  font-family: "iconfont";
  src: url("./font/iconfont.eot?t=1619246879033"); /* IE9 */
  src: url("./font/iconfont.eot?t=1619246879033#iefix")
      format("embedded-opentype"),
    /* IE6-IE8 */
      url("data:application/x-font-woff2;charset=utf-8;base64,d09GMgABAAAAAAOUAAsAAAAAB/gAAANGAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHEIGVgCCcAqEAIMRATYCJAMICwYABCAFhG0HMRu4BhEVnBXIfhbGzosiSens4+dPubT5NJqhauz3iwiqtX97bvchqo/kQLMGFPKrkNFhIWM8sJGpSBY+9/dz+pIC/QxLdp1QRI7UXJGTmy8g/gwQhZ/RE256939qh32hA8rCPE+02/+4P5J9uS7bxiUqYAGbzuD9fxzutbGF5rvLc5xzURdgHFBAe2ObrED6YPyHsQta4nkCTXN2xOn6hgbqMnNaIB5sMk6oZ1RyQ3aoC9WKtRniNfDUizL5A7wKvh//TIYQFCoJzLwLes0Dh78dKy6l/m8sHgLY0xnANpGwg0zcVJrOIEWhHUlTDWVLbCs7+EmVpcfa7D8eQVTBzGyDGci6JrbDudS/LEBGD08BfBvUj157mCsUCYViWyDxDhE5aaxgWJm3L/X0oCKncTotqFJBisbRXoaWGuESLHdVjKY0K3FWt6UueJzYJQ6bPL2+zMlKxa7KjoIxpnpAL3EqkgKHt88qzNgwVYG72gdDSkoXHkOY5fKLm8Y9qaEvw5gws5cyr8Ms7oFBJtP03+7NzfCwo1aNBI4xPleV4Ytc1C3pZtypun47M5967kD71cr04qokEXG/qUfBjaCEJD4GK1EtHoeIEiKIUTV1UKlOtXCiVJBoMgQx7hYqj+zHE80M4M3bPpq/0uWjokh6Ilhl8SMl3BFkHKhbaGjF/UAlgP0nYtpn6pSHSqKi41rgjxLPBVj2kUI7BNRvfo4SCTgEKN+mT87Eb/uN/162Dy7/1VtcgO/XzQWO8m2GbhbqN2cOfhK7Y0vWuKa6yAq7MlZ4CoM3X9XURAnbhn4MtUxIDKHO2RAKNbOQ1K0gM3YHKlr2oKrudABN28rNLSNkKXIDW94AQt8HCl0fIen7IjP2BxVTf6jqxxKa7mK0Z8taBHFCKBkNqCsE3XfW1rIIszfojo2kNDcgH5Cm4IU0SvLREjukKRZMJ5cxW7DUt1CAy7Bpehior1Bz5JmHPI5t1Zsi3bcz4QRBEkMGUK5AoPU61uvMROHzG8g5akjU0FRlPkBkEnoHqUjSAVmKuk5Nt3LN5MTJMGYBi/RaoAAG1FihHhiqR1WQxiJ+QGCQi1E721UULS9p324XNJnyIqyhSe0eO6c9zmYAAA==")
      format("woff2"),
    url("./font/iconfont.woff?t=1619246879033") format("woff"),
    url("./font/iconfont.ttf?t=1619246879033") format("truetype"),
    /* chrome, firefox, opera, Safari, Android, iOS 4.2+ */
      url("./font/iconfont.svg?t=1619246879033#iconfont") format("svg"); /* iOS 4.1- */
}

.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-fengche:before {
  content: "\e60d";
}
```

②使用file-loader解析这些后缀名的文件

```js
module: {//使用loader
  rules: [
    {
      test: /\.(eot|woff|ttf|svg)/,
      include: [path.resolve(__dirname, 'src/font')],//只处理src下的font文件夹
      use: {
        loader: 'file-loader',
        options: { outputPath: 'font/' },//打包到dist下的font文件夹
      }
    }
  ]
} 
```

然后就可以使用对应的类名加载图标了

```js
const App = document.getElementById('app')
//引入字体图标
App.innerHTML = '<div class="iconfont icon-fengche"></div>';
```

### 实现一个babel-loader：

#### 步骤一：

新建一个文件custom-loader/babel-loader.js

```js
//babel-loader.js
const babel = require('@babel/core')//代码编写babel转换
const loaderUtils = require('loader-utils')//获取webpack配置中的传参
const validateOptions = require('schema-utils')//用于验证loader配置中传的option的合法性(类似于mongoose)

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
```

#### 步骤二：

安装@babel/core（babel提供的编程转换功能）和loader-utils（用于获取webpack中loader配置项的传参）

- `npm i -D @babel/core loader-utils`

```js
//webpack.config.js
resolveLoader: {//配置loader存在的文件夹，默认只有node_modules
    modules: ['node_modules', path.resolve(__dirname, 'custom-loader')]
},
```





## 3】SourceMap

`将dist文件夹下打包好的代码目录结构`和`源代码目录结构`联系起来，就是SourceMap

```js
//举例：比如说，在src/index.js的第一行，写了一句console.logg('下次一定！')
/*很明显在打包好之后执行是有问题的，在浏览器上点开错误，我们发现是dist/bundle.js的第七行。
我们需要很快定位到源文件中代码的问题，就需要SourceMap
*/
dist/bundle.js的第七行 --> src/index.js的第一行
```

#### 开启SourceMap

```js
module.exports = {
  mode: 'development',
  entry:{...},
  output:{...},
  devtool:'eval-source-map',//开启SourceMap代码映射，如果不使用就填false
  ...
}
```

#### 配置SourceMap

这个devtool属性有很多取值，参考官网：https://v4.webpack.docschina.org/configuration/devtool/#devtool

注意：不同的值**会明显影响到构建**(build)和重新构建(rebuild)的速度。

`SourceMapDevToolPlugin`*/*`EvalSourceMapDevToolPlugin`插件来使用sourcemap配置项更丰富。

*切勿同时使用* `devtool` *选项和* `SourceMapDevToolPlugin`*/*`EvalSourceMapDevToolPlugin` *插件*

- 常用的配置：

  - `eval`：打包是最快的。使用的是：js的eval来执行。（但是代码多了之后不是很准确）

  - `inline-source-map`：不会生成.map文件，而是将sourcemap放在bundle.js最后一行用**base64格式储存**。（**完整代码**映射关系）

  - `inline-cheap-source-map`：生成方式和👆的一样，但是这个更粗略，所以构建更快一点（**行的代码映射、只会记录业务代码的映射**）。

  - `inline-cheap-module-source-map`：生成方式和👆的一样，（**也是行代码映射，但不仅会记录业务代码映射，而且会记录第三方库的代码映射**）

  - `eval-cheap-module-source-map`：最佳实践开发的环境用这个。

  - `cheap-module-source-map`：生产环境用这个（线上发生错误的时候提示更全面）

    

## 4】WebpackDevServer

#### 方式一：命令行

使用webpack-cli命令行中的参数--watch，记得在HtmlWebpackPlugin插件中关掉缓存。

弊端：每次保存代码之后，需要手动刷新浏览器（而且没有模块热更新功能）。

```json
//package.json
{
  "name": "webpacktest",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "watch": "webpack --watch"
  }
  ...
}
//webpack.config.js
 new HtmlWebpackPlugin({
   template: './src/index.html',
   cache: false//关闭缓存
 }),
```

#### 方式二：使用webpack-dev-server

优点：保存文件后会直接执行重新打包，并刷新服务器（有模块热更新、可以请求转发代理）

分为三步：

①安装开发者服务器

`npm i -D webpack-dev-server`

②配置webpack.config.js的devServer属性

```js
//webpack.config.js
module.exports = {
  entry: {...},
  //配置告诉devServer，打包好的文件该到dist文件夹下去取
  devServer: { contentBase: './dist' },
  mode: 'development',
  output: {...},
  ...
}
```

③使用命令行启动

```bash
webpack serve
```

##### 请求转发（反向代理）

```js
//webpack.config.js
module.exports = {
  entry: {...},
  devServer: { 
    //配置告诉devServer，打包好的文件该到dist文件夹下去取
    contentBase: './dist',//在webpack4+该字段也可以用static
    hot:true,//启动热模块更新webpack-dev-server3默认不启动，4+默认启动
    proxy:{//配置反向代理
      '/api':{//只要是遇到域名后面是/api开头的请求都转发到target去
        target:'http://www.weshineapp.com/',
        pathRewrite: {//将/api开头的，'/api'改成'api'
          '^/api': '/api'
        },
        changeOrigin:true//跨域请求
      }
    }
  },
  mode: 'development',
  output: {...},
  ...
};

//index.js我们可以使用fetch来请求一个接口试试
//其实接口地址是：http://www.weshineapp.com/api/v1/index/package/3454?offset=0&limit=18
fetch('/api/v1/index/package/3454?offset=0&limit=18')
.then(d => d.json()).then(d => console.log(d))
```



##### HMR模块热替换

默认是不启动热模块替换的，需要在devServer配置中加上`hot:true`。

热替换会让页面不会进行刷新，而是**会保留保存代码之前的页面运行中的状态**。

光光在devServer中配置`hot:true`，只能保证一些css代码改变之后再保存，页面的函数执行状态保留不变。（因为HMR修改css的时候使用了`style-loader`，并没有触发js文件解析，而这些状态都是JS执行产生的。css的HMR也就没有JS状态热更新麻烦）

如果js中一个模块代码改变之后保存，想要不丢失另外的模块的状态，还需要一些深层次的配置。

###### JS状态的HMR：

```js
/*举个栗子：
一个模块中依赖了两个子组件，此时我们在页面上可以点击module1组件进行计数。
再修改module2的值，保存代码，会发现HMR丢失了module1的状态*/

//index.js
import module1 from './module/module1.js'
import module2 from './module/module2.js'
//加载模块一和模块二（js的HMR）
module1()
module2()

//module/module1.js
function module1() {
  const Div = document.createElement('div');
  Div.innerText = 0
  Div.setAttribute('id', 'module1')
  Div.addEventListener('click', () => {
    Div.innerText++
  })
  document.body.appendChild(Div);
}
export default module1

//module/module2.js
function module2() {
  const Div = document.createElement('div');
  Div.setAttribute('id', 'module2')
  Div.innerText = 3000//触发点击改变了module1的状态，再修改module2的状态，保存代码，会发现HMR丢失了module1的状态
  document.body.appendChild(Div);
}
export default module2
```

此时如果我们想要实现更改module2的代码，但是module1中的执行状态不改变，就需要使用module.hot进行拦截一下：

```js
//index.js
import module1 from './module/module1.js'
import module2 from './module/module2.js'

//HMR拦截
if (module.hot) {
  //但我们接收到module2.js代码改变时做出拦截，只会执行回调中的代码，不进行其他刷新
  module.hot.accept('./module/module2.js', () => {
    //将之前的dom删除
    document.body.removeChild(document.getElementById('module2'));
    module2()//重新执行module2.js
  })
}

//加载模块一和模块二（js的HMR）
module1()
module2()
```





## 5】plugin

### 常用plugin

总结一句话就是：插件可以在webpack运行在某个阶段（生命周期）做一些事情。

比如：html-webpack-plugin就是在打包结束的时候，将打包好的js文件引用到指定模板html文件中。

再比如： clean-webpack-plugin就是在刚开始webpack启动的时候，将dist文件夹清空。

TerserPlugin：首先了解下 webpack 中用于代码删除和压缩的一个插件，TerserPlugin。 Webpack4.0 默认使用 terser-webpack-plugin 压缩插件，在此之前是使用 uglifyjs-webpack-plugin，其中的区别是内置对 ES6 的压缩不是很好，同时我们可以打开 parallel 参数，使用多进程压缩，加快压缩。

mini-css-extract-plugin是用来单独打包css，用法如下

```js
plugins: [
  new MiniCssExtractPlugin({
    filename: "[name].[chunkhash:8].css",
    chunkFilename: "[id].css"
  })
],
module: {
  rules: [{
    test: /\.css$/,
    use: [
      MiniCssExtractPlugin.loader,//这里就不使用'style-loader'，因为我们不需要使用style标签，自动使用link标签链接打包好的css
      "css-loader"
    ]
  }]
}
```





### 手写plugin

在webpack的npm依赖包中可以找到一个名叫Compiler.js的文件，里面有所所有的钩子。

[webpack提供了很多钩子](https://webpack.docschina.org/api/compiler-hooks/)，这里简单介绍几个：

- entryOption : 在 webpack 选项中的 entry 配置项 处理过之后，执行插件。
- afterPlugins : 设置完初始插件之后，执行插件。
- compilation : 编译创建之后，生成文件之前，执行插件。。
- emit : 生成资源到 output 目录之前。
- done : 编译完成。

在 `compiler.hooks` 下指定事件钩子函数，便会触发钩子时，执行回调函数。
Webpack 提供[三种触发钩子的方法](https://blog.csdn.net/qq_36380426/article/details/104471422)：

- `tap` ：以**同步方式**触发钩子；
  - 回调方式:`(compilation)=>{}`
  - 同步执行。
- `tapAsync` ：以**异步方式**触发钩子；
  - 回调方式:`(compilation,end)=>{end()}`
  - 必须使用第二个参数来执行，结束该回调，webpack才能继续执行。
- `tapPromise` ：以**异步方式**触发钩子，返回 Promise；
  - 回调方式:`(compilation)=>Promise`
  - 必须使用Promise提供的resolve或者reject才能结束回调，webpack才能继续。

#### ①同步触发

需要在我们写的插件的类中写一个原型方法apply并传入一个上下文形参。

因为在在webpack过程中，使用我们插件的时候，会调用执行插件原型上的apply方法，并将上下文实体传入。

```js
//CustomPlugin.js
class CustomPlugin {
  apply(compiler) {//compiler.hooks
    //调用我们需要使用的钩子，并写入回调
    compiler.hooks.done.tap('Hello Custom Plugin', (
      compilation /* 在 hook 被触及时，会将 compilation 作为参数传入。 */
    ) => {
      console.log(compilation)
      console.log('Hello Custom Plugin!');
    });
  }
}
module.exports = CustomPlugin

//webpack.config.js
const CustomPlugin = require('CustomPlugin');
module.exports={
  ...//传入的是插件实例
  plugins:[new CustomPlugin()],
  ...
}
```

#### ②异步触发钩子

```js
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

/*此时执行的打包会在控制台输出一下内容：
开始第一次等待~~~~~~~~ 2021-05-01T04:18:57.491Z
第一次等待结束~~~~~~~~ 2021-05-01T04:19:00.495Z
开始第二次等待~~~~~~~~ 2021-05-01T04:19:00.496Z
第二次等待结束~~~~~~~~ 2021-05-01T04:19:03.499Z
编译完成~~~~
....
webpack 5.35.0 compiled successfully in 7078 ms
*/
```



### [FileListPlugin](https://www.bilibili.com/video/BV1QE411M7sj?p=53)

首先明确需求，我们想要获取webpack打包好的各文件的名字和大小，然后创建一个md格式的文件并输出。结果预览：以下是打包出来的list.md文件

```md
## 文件名    资源大小
- lazyLoad_e5d002d4cb2150bdd8ce.bundle.js    13544
- src_module_module1_js_e5d002d4cb2150bdd8ce.bundle.js    2243
- index.html    426
```

我们先来看看该怎么用我们写的这个插件：

```js
//webpack.config.js
const FileListPlugin = require('FileListPlugin')
module.exports={
  ...
  plugins:[
    new FileListPlugin({
      filename:'list.md'
    })
  ],
  ...
}
```

开始写代码FileListPlugin.js

```js
class FileListPlugin {
  constructor({ filename }) {
    this.filename = filename
  }
  apply(compiler) {//webpack会调用apply
    compiler.hooks.emit.tap(//同步处理。不需要结束回调
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
```



### [InlineSourcePlugin](https://www.bilibili.com/video/BV1QE411M7sj?p=54)

首先明确需求：常规的操作是使用html-webpack-plugin将打包好的js文件以外链src的形式导入html，css文件也是使用Link外链的形式去导入；而我们现在的需求是要把打包好的**js文件内容和css文件内容**直接以script和style标签的形式插到html中。

需要配合html-webpack-plugin一起使用，因为需要使用到[html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin#events)的钩子api对HtmlWebpackPlugin执行过程进行处理。（这里注意使用alterAssetTagGroups钩子，**把使用了HtmlWebpackPlugin插件且即将插入html的标签都进行预处理一下**，同时也可以将外链的文件放到**cdn进行打包优化**）

还是我们先看下该怎么用这个插件再去写：

```js
//webpack.config.js
const InlineSourcePlugin = require('InlineSourcePlugin')
module.exports = {
  ...
  plugins:[
    new InlineSourcePlugin({
      /*需要传入一个正则，判断需要修改的标签中外链文件的后缀，
      因为也有可能link一些json等文件到html中，
      目的是处理外链文件是.js结尾的script标签和外链文件是.css结尾的link标签*/
      match: /\.(js|css)/
    })
  ],
  ...
}
```

具体实现：

```js
const HtmlWebpackPlugin = require('html-webpack-plugin')

/**
 * 首先明确需求：
 * 常规的操作是使用html-webpack-plugin将打包好的js文件以外链src的形式导入html，css文件也是使用Link外链的形式去导入；
 * 而我们现在的需求是要把打包好的js文件内容和css文件内容直接以script和style标签的形式插到html中。
 */
class InlineSourcePlugin {
  constructor({ match }) {
    //需要传入一个正则，判断需要内联的文件类型
    this.regex = match
  }
  apply(compiler) {
    //需要使用到HtmlWebpackPlugin的钩子api对HtmlWebpackPlugin执行过程进行处理。
    //1.首先把webpack执行上下文compilation暴露给HtmlWebpackPlugin使用
    compiler.hooks.compilation.tap('InlineSourcePlugin', (compilation) => {
      //2.使用HtmlWebpackPlugin提供的hooks api进行处理
      //https://github.com/jantimon/html-webpack-plugin#events
      //此时我们用到的是alterAssetTagGroups（修改插入标签组到html的时候的钩子）
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
        'alterPlugin',
        (data, end) => {
          // console.log(data)//打印出来的重要内容是，将要经HtmlWebpackPlugin处理插入html的标签信息
          //需要写一个方法来处理标签并返回处理结果
          data = this.processTags(data, compilation)
          //成功之后把处理结果，以回调的方式返回去
          end(null, data)
        }
      )
    })
  }
  //外链资源的标签处理成内联的形式（标签+内容）
  processTags(data, compilation) {
    let headTags = []
    let bodyTags = []
    //需要将要处理的项的记过分别存到数组中，最后一起返回
    data.headTags.forEach(item => {
      headTags.push(this.handleTag(item, compilation))
    })
    data.bodyTags.forEach(item => {
      bodyTags.push(this.handleTag(item, compilation))
    })
    return { ...data, headTags, bodyTags }//将处理结果返回
  }
  //正式处理标签
  handleTag(tag, compilation) {
    /*console.log(tag)//打印一下即将插入的标签对象，然后就可以开始安找自己的需求进行处理。
    {
      tagName: 'script',
      voidTag: false,
      meta: { plugin: 'html-webpack-plugin' },
      attributes: { defer: true, src: 'index_d187911761f8039b458f.bundle.js' }
    }
    {
      tagName: 'link',
      voidTag: true,
      meta: { plugin: 'html-webpack-plugin' },
      attributes: { href: 'index.70ae7073.css', rel: 'stylesheet' }
    }*/
    let newTag = { ...tag };
    let url;
    if (tag.tagName === 'link' && this.regex.test(tag.attributes.href)) {
      //处理外链文件是.css结尾的link标签
      newTag = {
        tagName: 'style',
        voidTag: false,
        attributes: { type: 'text/css' }
      }
      url = tag.attributes.href
      if (url) {
        //使用compilation上下文的资源对象获取打包好的文件，然后写入到style标签的innerHTML属性上
        newTag.innerHTML = compilation.assets[url].source()
        delete compilation.assets[url]//将原来将要打包生成的文件删除掉，因为内容已经放到了html的标签中
      }
    }

    if (tag.tagName === 'script' && this.regex.test(tag.attributes.src)) {
      //处理外链文件是.js结尾的script标签
      newTag = {
        tagName: 'script',
        voidTag: false,
        attributes: { type: 'application/javascript' }
      }
      url = tag.attributes.src
      if (url) {
        //使用compilation上下文的资源对象获取打包好的文件，然后写入到script标签的innerHTML属性上
        newTag.innerHTML = compilation.assets[url].source()
        delete compilation.assets[url]//将原来将要打包生成的文件删除掉，因为内容已经放到了html的标签中
      }
    }
    return newTag//返回修改后的新标签
  }
}

module.exports = InlineSourcePlugin
```

可以用这个来实现资源打包到cdn，然后再插入标签，优化打包。

### [UploadPlugin](https://www.bilibili.com/video/BV1QE411M7sj?p=55&spm_id_from=pageDriver)

需求：使用UploadPlugin可以将打包好的文件上传到cdn或oss上面，从而实现自动发布。

还是先来看看该怎么使用：

```js
//webpack.config.js
const UploadPlugin = require('UploadPlugin')
module.exports = {
  ...
  output: { 
    //添加src时，的根路径比如现在就是src='http://cdn.xxx.com/[name].bundle.js'
    publicPath: 'http://cdn.xxx.com/',
    ...
  },
  plugins:[
    //需要传入一些oss、cdn相关的对象存储配置项
    new UploadPlugin({
      region: 'oss-cn-chengdu',
      accessKeyId: '',
      accessKeySecret: '',
      bucket: ''
    })
  ],
  ...
}
```

实现：

```js
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
```





## 6】webpack打包优化

webpack可以做什么？代码转换、文件优化、代码分割、模块合并、模块热替换、代码校验、自动发布。

### 原理分析：

```js
//theory_analysis.js
console.log('Hello');

//dist/bundle.js打包出来的结果
(() => {
  var __webpack_modules__ = {
    "./src/theory_analysis.js": () => { eval("console.log('Hello');"); }
  };
  var __webpack_exports__ = {};
  __webpack_modules__["./src/theory_analysis.js"]();
})();
```

### webpack自带的优化：

#### 1、tree-sharking

依赖关系的解析（不用的代码不打包）**webpack的生产环境才会使用tree-sharking**。

#### 2、scope-hoisting

作用域提升（定义的变量或者常量，如果不传入函数计算，都不打包到结果中，而是直接使用定义的常量）



### 速度的优化：

#### 1、happypack

多线程打包（注意体积比较小的时候，打包比较慢）

#### 2、[Dll动态链接库](https://blog.csdn.net/u012987546/article/details/100580745)

拆一些公共的文件：react/react-dom/vue/jQuery，单独打包到一个文件。最后将这个文件放在cdn上。（也可以在开发时使用dll，链接库只需要被构建一次，大大提升项目构建效率）

主要使用两个webpack内置的插件：**DllPlugin**、**DllReferencePlugin**

- DllPlugin：生成动态链接库dll的插件。（在打包比较大的公共框架（比如react、vue、jQuery）文件的webpack打包配置文件中使用）
- DllReferencePlugin：用来在项目中引用动态链接库的插件（在构建项目的webpack打包配置文件中使用）

##### 步骤一：

单独启webpack配置文件打包动态链接库。我们在项目根目录下创建一个`webpack_dll.config.js`文件（用于打包生成动态链接库），会用到DllPlugin插件

```js
//webpack_dll.config.js
//单独打包react用动态链接库Dll
const path = require('path');
const webpack = require('webpack')
module.exports = {
  mode: 'development',
  entry: {
    /*把项目需要所有的 react 相关的放到一个单独的动态链接库
      又例如：vue: ['vue', 'vuex', 'vue-router'],
      jquery: ['jQuery']*/
    react: ['react', 'react-dom']
  },
  output: {
    filename: '[name].dll.js',//打包后的文件名称
    path: path.resolve(__dirname, 'dll'),//输出到的文件夹
    library: '_dll_[name]'//存放动态链接库的全局变量名称，加上_dll_是为了防止全局变量冲突
  },
  plugins: [
    //使用webpack内置的生成动态链接库dll的插件（会生成两个文件，一个是打包好的库代码，另一个是映射文件）
    new webpack.DllPlugin({
      /*动态链接库的全局变量名称，需要和 output.library 中保持一致
        该字段的值也就是输出的 manifest.json 文件 中 name 字段的值
        例如 react.manifest.json 中就有 "name": "_dll_react"*/
      name: '_dll_[name]',
      // 描述动态链接库的 manifest.json 文件输出时的文件名称
      path: path.join(__dirname, 'dll', '[name].manifest.json'),
    })
  ]
}
```

##### 步骤二：

此时，我们为了方便，需要在`package.json`中创建打包动态链接库的脚本命令：

```json
{
  "name": "webpacktest",
  "version": "1.0.0",
  "description": "",
  "main": "webpack.config.js",
  "scripts": {
		...
    "dll": "webpack --mode development --config webpack_dll.config.js"
  },
  ...
}
```

此时我们就可以执行命令`npm run dll`，将动态链接库打包好了。并输出到dll文件夹下，生成了两个文件`react.dll.js`（打包的库代码）和`react.manifest.json`（动态链接映射文件）（这个打包好的动态链接库可以放到cdn上进行优化）

##### 步骤三：

在html文件中以script标签的形式**手动插入动态链接库**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>webpack测试打包</title>
  <!-- 库文件必须要放在最前面 -->
  <script defer src="../dll/react.dll.js"></script>
  <script defer src="theory_analysis_38a7916d0fdc58ecb1c9.bundle.js"></script>
</head>
<body>
  <h1>头像</h1>
  <div id="app"></div>
</body>
</html>
```

这时候还不行，因为虽然我们这样引入了动态链接库，但是bundle.js打包出来的代码还不知道该怎么去使用这个动态链接库，所以还得在项目打包的时候进行使用DllReferencePlugin

##### 步骤四：

项目webpack配置中使用DllReferencePlugin进行引用库。使用了这个插件，webpack打包的时候就优先会去使用dll动态链接库中的变量，不会再去react这些框架了。

```js
//webpack.config.js
const path = require('path')
const webpack = require('webpack')
//生成一个html模板
const HtmlWebpackPlugin = require('html-webpack-plugin')
//启动时清空dist文件夹
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: {//入口
    theory_analysis: './src/theory_analysis.js'
  },
  mode: 'development',
  output: {
    filename: '[name]_[hash].bundle.js',
    path: path.join(__dirname, 'dist')//打包到的文件夹
  },
  plugins: [//使用插件
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      cache: false
    }),
    //引用动态链接库的插件(告诉webpack我们用了哪些动态链接库，该怎么使用这些dll)
    new webpack.DllReferencePlugin({
      //需要找到生成的dll动态链接库的manifest映射文件
      manifest: path.resolve(__dirname, 'dll', 'react.manifest.json')
      //manifest: require('./dll/react.manifest.json'),//这样也可以
    })
  ],
.....
}
```

这是我打包的js文件，使用了react和react-dom

```jsx
//theory_analysis.js
import React from 'react'
import { render } from 'react-dom'

const App = () => {
  return <div>这是react-app</div>
}

render(<App />, document.getElementById('app'))
```



#### 3、Externals配置项忽略打包

当在webpack.config.js中配置Externals 项时，Externals 项用来告诉 Webpack 构建时代码中使用了哪些不用被打包的模块。Externals可以对某一个第三方框架 或者 库**放到运行环境的全局变量中**。例如：vue放到到运行环境的全局变量中 或者 vuex放到到运行环境的全局变量中。





### 体积的优化：

#### 1、webpack.IgnorePlugin()

忽略不用的国际化语言包。

典型：moment.js

```js
plugins:[
  ...
  new webpack.IgnorePlugin(/\.\/locale/,/moment/)
]
```

#### 2、抽离公共代码块

optimization配置项中的splitChunks分割代码块

一般多个入口打包才使用抽离公共代码块（将以已打包好的代码进行抽离）

```js
//webpack.config.js
module.exports={
  entry:{
    index:'./src/index.js'
    other:'./src/other.js'
  },
  ...,
  optimization:{//优化
  	splitChunks:{//分割代码块（将以已打包好的代码进行抽离）
  		cacheGroup:{//缓存组
  			common:{//缓存组的名称叫common
  				chunks:'initial',//定义什么时候进行抽离，刚开始就开始抽离
  				minSize:0,//代码块最小多大，才开始提取
  				minChunks:2//代码块最少公用过多少次的代码才进行提取
				},
  			vendor:{//第三方库文件单独进行抽离，定义名称叫vendor
          priority:1,//定义权重，先抽离第三方库文件，再去抽离其他的文件
          test:/node_modules/,//只去把node_module中使用过的代码抽离出来
          chunks:'initial',//也是刚开始的时候进行抽离
          minSize:0,
          minChunks:2
        }
			}
		}
	}
}
```



### 懒加载模块（按需加载）

webpack提供按需动态加载，使用import语法（ajax来实现的）（或者`require.ensure`也可以动态加载）

使用import语法动态导入，webpack会将该文件单独打包。

```js
//index.js
import('./source.js').then(data=>{//es6草案中的语法，ajax实现
  console.log(data.default)
})

//source.js
export default 'Hello'
```

import语法懒加载原理：

```js
//模块：file.js
function getJSON(url, callback) {
  let xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText)
  };
  xhr.open('GET', url, true);
  xhr.send();
}
export function getUsefulContents(url, callback) {
  getJSON(url, data => callback(JSON.parse(data)));
}

//主程序：main.js
import { getUsefulContents } from '/modules/file.js';
getUsefulContents('http://www.example.com',
    data => { doSomethingUseful(data) });
```



## 7】[resolve配置](https://www.cnblogs.com/pingan8787/p/11838067.html)

```js
 resolve: {
   extensions: ['.tsx', '.jsx', '.js'],//不需要写后缀名，按顺序去找文件
     alias: {//别名
       '@': path.resolve(__dirname, 'src')
     },
       modules: [path.resolve(__dirname, "./src/"), "node_modules"]
   //告诉 webpack 解析模块时应该搜索的目录，即 require 或 import 模块的时候，只写模块名的时候，到哪里去找，其属性值为数组，因为可配置多个模块搜索路径，其搜索路径必须为绝对路径，
 },
```





参考视频：

https://www.bilibili.com/video/BV12a4y1W76V

https://www.bilibili.com/video/BV1eC4y147RX