import isMobile from 'ismobilejs'
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

    let down = 'mousedown'
    let move = 'mousemove'
    let up = 'mouseup'

    if ((isMobile.phone || isMobile.tablet)) {
      down = 'touchstart'
      move = 'touchmove'
      up = 'touchend'
    }

    let imageWidth = img.width
    let imageHeight = img.height
    const limitWidth = canvasContainer.offsetWidth
    const limitHeight = canvasContainer.offsetHeight

    while (imageWidth > limitWidth || imageHeight > limitHeight) {
      if (imageWidth > limitWidth || imageHeight > limitHeight) {
        const res = resizeImage(img, limitWidth, limitHeight)
        imageWidth = res.newImage.width
        imageHeight = res.newImage.height
        image = res.newImage
      } else {
        image = img;
      }
    }

    // create image canvas
    const canvasBack = document.createElement('canvas');
    canvasBack.height = Math.floor(image.height) - 1;
    canvasBack.width = Math.floor(image.width) - 1;

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
    let md = Rx.Observable.fromEvent(canvas, down).subscribe(_onMousedown)
    _styleCursorListener();

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

      const ep = cw.getEditPoint(curPos)
      let callback;

      if (ep) {
        callback = _handleRectResize;
      } else if (cw.isInside(curPos)) {
        callback = _handleRectMove;
      }

      if (callback) {
        // redraw canvas on mousemoves
        Rx.Observable
          .fromEvent(canvasContainer, move)
          .map(callback)
          .takeUntil(Rx.Observable.fromEvent(canvasContainer, up))
          .subscribe(_redrawCanvas)

        // Callback subscription, if there is any, on mouse up
        Rx.Observable
          .fromEvent(canvasContainer, up)
          .take(1) // take only first event of series
          .subscribe(_onMouseup)
      }
    }

    function _onMouseup(e) {
      curPos = _getPosition(e);

      if (cw.hasBbox() && subscription) {
        cw.saveBbox()

        const origin = cw.getUpperLeftCorner();
        const final = cw.getBottomRightCorner();

        subscription({
          x1: Math.round(origin.x / ratio),
          x2: Math.round(final.x / ratio),
          y1: Math.round(origin.y / ratio),
          y2: Math.round(final.y / ratio)
        })
      }

      return _styleCursorListener()
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
      const ep = cw.getEditPoint(pos);

      if (ep) {
        canvas.style.cursor = ep.style;
      } else if (cw.isInside(pos) && canvas.style.cursor !== 'move') {
        canvas.style.cursor = 'move';
      } else if (!cw.isInside(pos) && canvas.style.cursor !== 'default') {
        canvas.style.cursor = 'default';
      }
    }

    function resizeImage(image, limitWidth, limitHeight) {
      if (
        typeof image === 'undefined' ||
        typeof limitWidth === 'undefined' ||
        typeof limitHeight === 'undefined'
      ) {
        throw new Error('missing argument')
      }

      if (image.width > limitWidth) {
        return resizeWidth(image, limitWidth)
      } else if (image.height > limitHeight) {
        return resizeHeight(image, limitHeight)
      }
    }

    function resizeWidth(image, limitWidth) {
      const newImage = document.createElement('img');
      ratio = limitWidth / image.width;

      newImage.src = image.src;
      newImage.width = image.width * ratio;
      newImage.height = image.height * ratio;

      return {
        newImage, ratio
      };
    }

    function resizeHeight(image, limitHeight) {
      const newImage = document.createElement('img');
      ratio = limitHeight / image.height;

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
        height: Math.round(delta.y),
        width: Math.round(delta.x),
      };
    }

    function _getPosition(e) {
      // get container position on document, it has a performance impact when window is resized
      container = canvas.getBoundingClientRect();

      if ((isMobile.phone || isMobile.tablet) && !e.touches.length) return

      return {
        x: Math.round((e.clientX || e.touches[0].clientX) - container.left),
        y: Math.round((e.clientY || e.touches[0].clientY) - container.top)
      }
    }

    function _getDelta(origin, e) {
      // get container position on document, it has a performance impact when window is resized
      container = canvas.getBoundingClientRect();

      return {
        x: Math.round((e.clientX || e.touches[0].clientX) - container.left - origin.x),
        y: Math.round((e.clientY || e.touches[0].clientY) - container.top - origin.y)
      }
    }

    function _styleCursorListener() {
      return Rx.Observable
        .fromEvent(canvasContainer, move)
        .takeUntil(Rx.Observable.fromEvent(canvasContainer, down))
        .subscribe(_styleCursor);
    }
  }
}

module.exports = Bbox
