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
    publicPath: 'http://cdn.xxx.com',
    //添加src时，的根路径比如现在就是src='http://cdn.xxx.com/[name].bundle.js'
    filename: '[name]_[hash].bundle.js',
    /*[name]对应的是entry中的名字;这里的'[name]'的规则命名称为占位符。
      也可以使用[ext]、[hash]；来使用占位符。这里的hash是根据文件内容来生成hash值（可以用于网络资源请求的缓存）
      */
    path: path.join(__dirname, 'dist')//打包到的文件夹
  },
  plugins: [//使用插件
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    new CleanWebpackPlugin(),
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
      test: /\.jpg$/,
      exclude: /node_modules/,
      use: {
        loader: 'file-loader',
        options: {
          // 如果不配置name，则是默认生成一段哈希作为文件名称
          name:'[name].[ext]'//使用原先的文件名和后缀名
        }
      },
    }]
  }
}
```

## 2】babel-loader

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



## 3】plugin

总结一句话就是：插件可以在webpack运行在某个阶段（生命周期）做一些事情。

比如：html-webpack-plugin就是在打包结束的时候，将打包好的js文件引用到指定模板html文件中。

再比如： clean-webpack-plugin就是在刚开始webpack启动的时候，将dist文件夹清空。





