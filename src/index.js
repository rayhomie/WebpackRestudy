import '@babel/polyfill'//补充ES6+的api的实现
import avatar from './头像.jpeg'
// import styles from './index.css'//启用css模块化，就不能使用正常导入
// import './index.less'
import './index.scss'
import module1 from './module/module1.js'
import module2 from './module/module2.js'

console.log('Hello')
const message = (params) => {//使用babel-loader将新语法转成es5
  const res = setTimeout(() => { console.log(params) })
  return res
}
message('hello呀')
//向页面插入一张图片
const App = document.getElementById('app')
const image = new Image()
image.src = avatar
image.className += 'avatar'//模块化哈希
App.appendChild(image)

//使用iconfont的图标或者字体
App.innerHTML = '<div class="iconfont icon-fengche"></div>';

//反向代理
fetch('/api/v1/index/package/3454?offset=0&limit=18')
  .then(d => d.json()).then(d => console.log(d))


//HMR拦截
if (module.hot) {
  //但我们接收到module2.js代码改变时做出拦截，只会执行回调中的代码，不进行其他刷新
  module.hot.accept('./module/module2.js', () => {
    //将之前的dom删除
    document.body.removeChild(document.getElementById('module2'));
    module2()//重新执行module2.js
  })
}

//加载模块一和模块二（js状态的HMR）
module1()
module2()