import s from './Selector.css'

export default function _Selector({position}) {
  const Selector = document.createElement('section');
  Selector.className = null;

  Selector.style.position = 'absolute'
  Selector.style.left = `${position.x}px`;
  Selector.style.top = `${position.y}px`;
  Selector.style.zIndex = 11;

  return {elm: Selector, draw};

  function draw(container) {
    container.appendChild(Selector);
  }
}
