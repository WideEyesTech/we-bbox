import Rx from 'rx'

import CanvasWindow from './CanvasWindow'

let instance;

const Bbox = (options) => {
  if (!instance) instance = _Bbox(options);

  return instance;

  function _Bbox({canvasContainer, img}) {
    let container;
    let image;
    let subscription;

    let curPos = {x: 0, y: 0};
    let ratio = 1;

    const imageWidth = img.width;
    const limitWidth = canvasContainer.offsetWidth;

    // resize image, if needed
    if (imageWidth > limitWidth) {
      const res = _resizeImage(img, limitWidth);
      image = res.newImage;
    } else {
      image = img;
    }

    // create image canvas
    const canvasBack = document.createElement('canvas');
    canvasBack.width = Math.floor(image.width) - 1;
    canvasBack.height = Math.floor(image.height) - 1;

    // draw image on canvas
    const ctxBack = canvasBack.getContext('2d');
    ctxBack.drawImage(image, 0, 0, Math.floor(image.width), Math.floor(image.height));

    // create cropping canvas
    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(image.width) - 1;
    canvas.height = Math.floor(image.height) - 1;
    canvas.style.position = 'absolute';
    canvas.style.left = 0;
    canvas.style.cursor = 'crosshair';
    canvas.setAttribute('id', 'the_canvas')

    const wrapper = document.createElement('div')
    wrapper.style.height = canvas.height;
    wrapper.style.margin = '0 auto';
    wrapper.style.position = 'relative';
    wrapper.style.width = canvas.width;

    // draw selection window
    const cw = CanvasWindow({
      canvas
    });

    // attach canvases to DOM
    wrapper.appendChild(canvasBack);
    wrapper.appendChild(canvas);
    canvasContainer.appendChild(wrapper);

    // EVENT LISTENERS
    const md = Rx.Observable.fromEvent(canvas, 'mousedown')
      .flatMap(_onMousedown)
      .subscribe(_redrawCanvas);

    const mu = Rx.Observable.fromEvent(canvasContainer, 'mouseup')
      .flatMap(_onMouseup)
      .subscribe(_styleCursor);

    Rx.Observable.fromEvent(canvasContainer, 'mousemove')
      .takeUntil(Rx.Observable.fromEvent(canvasContainer, 'mousedown'))
      .subscribe(_styleCursor);

    // MAIN RETURN
    return {
      canvas,
      dispose,
      subscribe
    };

    function dispose() {
      // clear DOM
      canvasContainer.innerHTML = '';

      // cancel event listeners
      if (md.dispose) md.dispose();
      if (mu.dispose) mu.dispose();

      // clear bbox instance
      instance = null;
    }

    function subscribe(callback) {
      subscription = callback;
    }

    function _onMousedown(md) {
      md.preventDefault();

      canvas.style.zIndex = 10;

      // get mouse position relative to container
      curPos = _getPosition(md, canvas);

      let callback;
      if (cw.isEditPoint(curPos)) {
        callback = _handleRectResize;
      } else if (cw.isInside(curPos)) {
        callback = _handleRectMove;
      } else {
        callback = _handleRectDraw;
      }

      // listen for mousemoves and cancel listener at mouseup
      return Rx.Observable.fromEvent(canvasContainer, 'mousemove')
        .map(callback)
        .takeUntil(Rx.Observable.fromEvent(canvasContainer, 'mouseup'));
    }

    function _onMouseup(e) {
      curPos = _getPosition(e);
      if (cw.hasBbox() && subscription) {
        const origin = cw.getOrigin();
        const final = cw.getFinal();
        subscription({
          x1: Math.round(origin.x / ratio),
          y1: Math.round(origin.y / ratio),
          x2: Math.round(final.x / ratio),
          y2: Math.round(final.y / ratio),
        })
      }

      return Rx.Observable.fromEvent(canvasContainer, 'mousemove')
        .takeUntil(Rx.Observable.fromEvent(canvasContainer, 'mousedown'))
    }

    function _handleRectResize(e) {
      const res = _getDelta(curPos, e)
      curPos = _getPosition(e);

      return {
        type: 'resize',
        data: {
          origin: curPos,
          delta: res
        }
      };
    }

    function _handleRectMove(e) {
      const res = _getDelta(curPos, e)
      curPos = _getPosition(e);

      return {
        type: 'move',
        data: res
      }
    }

    function _handleRectDraw(e) {
      const res = _getRectangle(curPos, e)
      return {
        type: 'draw',
        data: res
      }
    }

    function _redrawCanvas(e) {
      switch (e.type) {
        case 'draw':
          cw.draw(e.data.origin, e.data.width, e.data.height);
          break;
        case 'move':
          cw.move(e.data);
          break;
        case 'resize':
          cw.resize(e.data.origin, e.data.delta);
          break;
        default:
          break;
      }
    }

    function _styleCursor(e) {
      const pos = _getPosition(e, canvasContainer);

      if (cw.isEditPoint(pos)) {
        const ep = cw.getEditPoint(pos);
        canvas.style.cursor = ep.style;
      } else if (cw.isInside(pos) && canvas.style.cursor !== 'move') {
        canvas.style.cursor = 'move';
      } else if (!cw.isInside(pos) && canvas.style.cursor !== 'crosshair') {
        canvas.style.cursor = 'crosshair';
      }
    }

    function _resizeImage(image, limitWidth) {
      const newImage = document.createElement('img');
      ratio = limitWidth / image.width;

      newImage.src = image.src;
      newImage.width = image.width * ratio;
      newImage.height = image.height * ratio;

      return {
        newImage, ratio
      };
    }

    function _getRectangle(origin, e) {
      const delta = _getDelta(origin, e);
      return {
        origin,
        height: delta.y,
        width: delta.x,
      };
    }

    function _getPosition(e) {
      // get container position on document, it has a performance impact when window is resized
      container = canvas.getBoundingClientRect();

      return {
        x: Math.round(e.clientX - container.left),
        y: Math.round(e.clientY - container.top)
      }
    }

    function _getDelta(origin, e) {
      // get container position on document, it has a performance impact when window is resized
      container = canvas.getBoundingClientRect();

      return {
        x: Math.round(e.clientX - container.left - origin.x),
        y: Math.round(e.clientY - container.top - origin.y)
      }
    }
  }
}

module.exports = Bbox
