# 重学webpack

## 1】入口出口配置

```js
const path = require('path')
const webpack = require('webpack')

//生成一个html模板
const HtmlWebpackPlugin = require('html-webpack-plugin')
//启动时清空dist文件夹
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
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
          { loader: "style-loader" },
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
        use: ['style-loader', 'css-loader', 'sass-loader','postcss-loader']
      },
      {//前提是安装less预处理器
        test: /\.less$/,
        exclude: /node_modules/,
        //从后往前的顺序进行读取：
        use: ['style-loader', 'css-loader', 'less-loader','postcss-loader']
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

总结一句话就是：插件可以在webpack运行在某个阶段（生命周期）做一些事情。

比如：html-webpack-plugin就是在打包结束的时候，将打包好的js文件引用到指定模板html文件中。

再比如： clean-webpack-plugin就是在刚开始webpack启动的时候，将dist文件夹清空。





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





参考视频：

https://www.bilibili.com/video/BV12a4y1W76V

https://www.bilibili.com/video/BV1eC4y147RX