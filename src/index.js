import avatar from './头像.jpeg'
// import styles from './index.css'//启用css模块化，就不能使用正常导入
// import './index.less'
import './index.scss'

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
