console.log('Hello')
const message = (params) => {
  const res = setTimeout(() => { console.log(params) })
  return res
}
message('hello呀')
