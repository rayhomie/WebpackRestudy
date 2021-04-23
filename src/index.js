import avatar from './头像.jpeg'
console.log('Hello')
const message = (params) => {
  const res = setTimeout(() => { console.log(params) })
  return res
}
message('hello呀')
const App = document.getElementById('app')
const image = new Image()
image.src = avatar
App.appendChild(image)
