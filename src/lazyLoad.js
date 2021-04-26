//按需加载、路由懒加载
const button = document.createElement('button')
button.innerHTML = '按需加载'

button.addEventListener('click', () => {
  import('./module/module1.js').then(data => data.default())
  //es6草案中的语法，ajax实现动态加载文件
})
document.body.appendChild(button)