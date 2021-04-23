import avatar from './头像.jpeg'
import './index.css'

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
image.className = 'avatar'
App.appendChild(image)
