import CanvasWindow from './CanvasWindow'
import isMobile from 'ismobilejs'
import { Observable } from 'rxjs/Observable'

import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/take'
import 'rxjs/add/operator/takeUntil'

export default function BBOX({
  canvasContainer,
  img,
  initCoords,
  maxHeight,
  onload
}) {
  if (img == null || canvasContainer == null) {
    console.warn(
      'BBOX: Missing some arguments in here...',
      `canvasContainer: ${typeof canvasContainer}`,
      `img: ${typeof img}`
    )
    return undefined
  }

  let container
  let subscription

  let image = img

  let curPos = { x: 0, y: 0 }
  let ratio = 1

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

  console.info('image: ' + imageWidth + 'x' + imageHeight)
  console.info('limit: ' + limitWidth + 'x' + limitHeight)

  if (!limitWidth) {
    return console.error('No available width. Make sure canvasContainer has width and height defined and greater than 0 before calling the annotator.')
  }

  // while (imageWidth > limitWidth || imageHeight > limitHeight) {}
  if (imageWidth > limitWidth) {
    const res = resizeWidth(image, limitWidth)
    imageWidth = res.newImage.width
    imageHeight = res.newImage.height
    image = res.newImage
  }

  console.info('finally: ')
  console.info('image: ' + imageWidth + 'x' + imageHeight)
  console.info('limit: ' + limitWidth + 'x' + limitHeight)

  // update ratio
  ratio = image.width / img.width

  console.info('ratio: ', ratio)

  // create image canvas
  const canvasBack = document.createElement('canvas')
  canvasBack.height = Math.floor(image.height) - 1
  canvasBack.width = Math.floor(image.width) - 1

  // draw image on canvas
  const ctxBack = canvasBack.getContext('2d')
  ctxBack.drawImage(image, 0, 0, Math.floor(image.width), Math.floor(image.height))

  // create cropping canvas
  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(image.width)
  canvas.height = Math.floor(image.height)
  canvas.style.top = 0
  canvas.style.left = 0
  canvas.style.position = 'absolute'
  canvas.setAttribute('id', 'the_canvas')

  const wrapper = document.createElement('div')
  wrapper.style.margin = '0 auto'
  wrapper.style.position = 'relative'
  wrapper.style.width = canvas.width + 'px'
  wrapper.style.height = canvas.height + 'px'

  const preparedCoords = initCoords ? {
    x1: initCoords.x1 * ratio,
    x2: initCoords.x2 * ratio,
    y1: initCoords.y1 * ratio,
    y2: initCoords.y2 * ratio
  } : null

  // draw selection window
  const cw = CanvasWindow({
    canvas,
    preparedCoords
  })

  // attach canvases to DOM
  wrapper.appendChild(canvasBack)
  wrapper.appendChild(canvas)
  canvasContainer.appendChild(wrapper)

  // EVENT LISTENERS
  const md = Observable
    .fromEvent(canvas, down)
    .subscribe(onMousedown)

  styleCursorListener()

  // optional onload callback
  try {
    if (onload) onload()
  } catch (e) {
    console.error(e.message)
  }

  // MAIN RETURN
  return {
    canvas,
    setBbox,
    dispose,
    subscribe
  }

  function dispose() {
    canvasContainer.innerHTML = ''
    if (md.dispose) md.dispose()
    instance = null
    ratio = 1
  }

  function subscribe(callback) {
    if (callback == null || typeof callback !== 'function') {
      console.warn('wrong argument type, expected function and got ', typeof callback)
      return undefined
    }

    subscription = callback
  }

  function setBbox(bbox) {
    if (bbox == null || typeof bbox !== 'object') {
      console.warn('wrong argument type: expected Object and got ', typeof bbox)
      return undefined
    } else if (
      bbox.x1 == null ||
      bbox.x2 == null ||
      bbox.y1 == null ||
      bbox.y1 == null
    ) {
      console.warn('bbox is missing at least one coordinate: ', bbox)
      return undefined
    }

    // check if type of all four coordinates is correct
    for (const coord in bbox) {
      if (bbox.hasOwnProperty(coord)) {
        if (typeof bbox[coord] !== 'number') {
          console.warn('wrong argument type: expected number and got ', typeof bbox[coord])
          return undefined
        }
      }
    }

    const origin = {
      x: bbox.x1 * ratio,
      y: bbox.y1 * ratio
    }

    const width = (bbox.x2 - bbox.x1) * ratio
    const height = (bbox.y2 - bbox.y1) * ratio
    console.log(`drawing bbox: ${JSON.stringify(bbox)} at origin: ${JSON.stringify(origin)}, width: ${width}, height: ${height}`);
    cw.draw(origin, width, height)
  }

  function onMousedown(md) {
    md.preventDefault()

    canvas.style.zIndex = 10

    // get mouse position relative to container
    curPos = _getPosition(md, canvas)

    const ep = cw.getEditPoint(curPos)
    let callback

    if (ep) {
      callback = _handleRectResize
    } else if (cw.isInside(curPos)) {
      callback = _handleRectMove
    }

    if (callback) {
      // redraw canvas on mousemoves
      Observable
        .fromEvent(canvasContainer, move)
        .map(callback)
        .takeUntil(Observable.fromEvent(canvasContainer, up))
        .subscribe(redrawCanvas)

      // Callback subscription, if there is any, on mouse up
      Observable
        .fromEvent(canvasContainer, up)
        .take(1) // take only first event of series
        .subscribe(_onMouseup)
    }
  }

  function _onMouseup(e) {
    e.preventDefault();
    curPos = _getPosition(e)

    if (cw.hasBbox() && subscription) {
      cw.saveBbox()

      const origin = cw.getUpperLeftCorner()
      const final = cw.getBottomRightCorner()

      subscription({
        x1: Math.round(origin.x / ratio),
        x2: Math.round(final.x / ratio),
        y1: Math.round(origin.y / ratio),
        y2: Math.round(final.y / ratio)
      })
    }

    return styleCursorListener()
  }

  function _handleRectResize(e) {
    const res = _getDelta(curPos, e)
    curPos = _getPosition(e)

    return {
      type: 'resize',
      data: {
        origin: curPos,
        delta: res
      }
    }
  }

  function _handleRectMove(e) {
    const res = _getDelta(curPos, e)
    curPos = _getPosition(e)

    return {
      type: 'move',
      data: res
    }
  }

  function redrawCanvas(e) {
    switch (e.type) {
      case 'draw':
        cw.draw(e.data.origin, e.data.width, e.data.height)
        break
      case 'move':
        cw.move(e.data)
        break
      case 'resize':
        cw.resize(e.data.origin, e.data.delta)
        break
      default:
        break
    }
  }

  function _styleCursor(e) {
    const pos = _getPosition(e, canvasContainer)
    const ep = cw.getEditPoint(pos)

    if (ep) {
      canvas.style.cursor = ep.style
    } else if (cw.isInside(pos) && canvas.style.cursor !== 'move') {
      canvas.style.cursor = 'move'
    } else if (!cw.isInside(pos) && canvas.style.cursor !== 'default') {
      canvas.style.cursor = 'default'
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
    const newImage = document.createElement('img')
    const ratio = limitWidth / image.width

    newImage.src = image.src
    newImage.width = image.width * ratio
    newImage.height = image.height * ratio

    return {
      newImage, ratio
    }
  }

  function resizeHeight(image, limitHeight) {
    const newImage = document.createElement('img')
    const ratio = limitHeight / image.height

    newImage.src = image.src
    newImage.width = image.width * ratio
    newImage.height = image.height * ratio

    return {
      newImage, ratio
    }
  }

  function _getPosition(e) {
    // get container position on document, it has a performance impact when window is resized
    container = canvas.getBoundingClientRect()

    if ((isMobile.phone || isMobile.tablet) && !e.touches.length) return

    return {
      x: Math.round((e.clientX || e.touches[0].clientX) - container.left),
      y: Math.round((e.clientY || e.touches[0].clientY) - container.top)
    }
  }

  function _getDelta(origin, e) {
    // get container position on document, it has a performance impact when window is resized
    container = canvas.getBoundingClientRect()

    return {
      x: Math.round((e.clientX || e.touches[0].clientX) - container.left - origin.x),
      y: Math.round((e.clientY || e.touches[0].clientY) - container.top - origin.y)
    }
  }

  function styleCursorListener() {
    return Observable
      .fromEvent(canvasContainer, move)
      .takeUntil(Observable.fromEvent(canvasContainer, down))
      .subscribe(_styleCursor)
  }
}

let instance
