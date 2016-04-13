import s from './Annotation.css'

export default function Annotation({
  editAnnotation,
  final,
  origin,
  removeAnnotation,
  tag,
}) {
  const Annotation = document.createElement('section');
  const bbox = document.createElement('section');
  const closeBtn = document.createElement('button')
  const editBtn = document.createElement('button')
  const iClose = document.createElement('i');
  const iEdit = document.createElement('i');
  const span = document.createElement('span')
  const Wrapper = document.createElement('section');

  const id = _getRandomArbitrary(0, 1000000); // annotation identifier

  // add classnames
  Annotation.className = s.bbox_annotation;
  bbox.className = s.bbox;
  closeBtn.className = s.bbox_annotation_close;
  editBtn.className = s.bbox_annotation_edit;
  iClose.className = 'fa fa-times';
  iEdit.className = 'fa fa-pencil';
  Wrapper.className = s.bbox_wrapper;

  // add baseline styles
  const height = final.y - origin.y; // helpers for the calculations below
  const width = final.x - origin.x; // helpers for the calculations below
  const wrapperPadding = 20; // helpers for the calculations below
  Wrapper.style.left = `${origin.x}px`;
  Wrapper.style.top = `${origin.y}px`;
  Wrapper.style.height = `${height + wrapperPadding / 2}px`;
  Wrapper.style.width = `${width + wrapperPadding}px`;

  bbox.style.left = `0px`;
  bbox.style.top = `0px`;
  bbox.style.height = `${height}px`;
  bbox.style.width = `${width}px`;

  Annotation.style.top = `${height / 2 - 25}px`;
  Annotation.style.left = `${width / 2 - 25}px`;

  // user interaction logic
  if (tag) span.innerHTML = tag;

  editBtn.onclick = (e) => {
    e.preventDefault();
    remove(Wrapper);
    editAnnotation({
      height,
      id,
      origin,
      width,
    });
  }

  closeBtn.onclick = (e) => {
    e.preventDefault();
    remove(Wrapper);
    removeAnnotation(id)
  };

  if (tag) Annotation.appendChild(span);
  closeBtn.appendChild(iClose);
  editBtn.appendChild(iEdit);

  bbox.appendChild(Annotation);
  bbox.appendChild(closeBtn);
  bbox.appendChild(editBtn);

  Wrapper.appendChild(bbox);

  // MAIN RETURN
  return {
    activate,
    deactivate,
    draw,
    elm: Wrapper,
    height,
    id,
    origin,
    remove,
    tag,
    width,
  };

  function activate() {
    Wrapper.className += ` ${s.active}`;
  }

  function deactivate() {
    Wrapper.className = Wrapper.className.replace(` ${s.active}`, '');
  }

  function draw(container) {
    container.appendChild(Wrapper);
  }

  function remove(container) {
    container.parentNode.removeChild(Wrapper);
  }

  function _getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }
}
