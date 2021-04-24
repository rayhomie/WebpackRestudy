# 重学webpack

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
  devtool:'eval-source-map',//开启SourceMap代码映射//默认是eval
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

    





## 4】plugin

总结一句话就是：插件可以在webpack运行在某个阶段（生命周期）做一些事情。

比如：html-webpack-plugin就是在打包结束的时候，将打包好的js文件引用到指定模板html文件中。

再比如： clean-webpack-plugin就是在刚开始webpack启动的时候，将dist文件夹清空。





https://www.bilibili.com/video/BV12a4y1W76V