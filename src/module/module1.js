function module1() {
  const Div = document.createElement('div');
  Div.innerText = 0
  Div.addEventListener('click', () => {
    Div.innerText++
  })
  Div.setAttribute('id', 'module1')
  document.body.appendChild(Div);
}

export default module1