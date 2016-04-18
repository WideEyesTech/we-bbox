import isMobile from 'ismobilejs'

import EditPoint from './EditPoint'

export default function CanvasWindow(options) {
  return _CanvasWindow(options);

  function _CanvasWindow(options) {
    let origin;
    let opposite;
    let currentBbox;

    let editPoints = [];
    let selectedEP = {};

    let delta = 5;
    if (isMobile.phone) delta = 30

    const globalAlpha = 0.3;
    const canvas = options.canvas;
    const ctx = canvas.getContext('2d');

    const w = canvas.width;
    const h = canvas.height;

    // init values
    let p1 = origin = {x: w / 3, y: h / 3}; // upper left corner of a bbox
    let p2 = opposite = {x: 2 * w / 3, y: 2 * h / 3}; // bottom right corner of a bbox
    let width = p2.x - p1.x;
    let height = p2.y - p1.y;

    _update();

    // MAIN RETURN
    return {
      draw,
      getBottomRightCorner,
      getEditPoint,
      getUpperLeftCorner,
      hasBbox,
      saveBbox,
      isInside,
      move,
      reset,
      resize
    };

    function getBottomRightCorner() {
      return p2;
    }

    function getUpperLeftCorner() {
      return p1;
    }

    function hasBbox() {
      if (!currentBbox) {
        return Math.abs(width) > delta && Math.abs(height) > delta;
      }

      if (
        Math.abs(p1.x - currentBbox.x) >= delta ||
        Math.abs(p1.y - currentBbox.y) >= delta ||
        Math.abs(width - currentBbox.width) >= delta ||
        Math.abs(height - currentBbox.height) >= delta
      ) {
        return Math.abs(width) > delta && Math.abs(height) > delta;
      }

      return false
    }

    function saveBbox() {
      currentBbox = {
        x: p1.x,
        y: p1.y,
        width: p2.x - p1.x,
        height: p2.y - p1.y
      }
    }

    function getEditPoint(point) {
      const selectedEPs = editPoints.filter(ep =>
        point.x > ep.x - delta &&
        point.y > ep.y - delta &&
        point.x < ep.x + delta &&
        point.y < ep.y + delta
      );

      if (selectedEPs.length > 0) {
        selectedEP = selectedEPs[0]
        return selectedEPs[0]
      } else {
        return null
      }
    }

    function isInside(point) {
      return (
        point.x > Math.min(origin.x, opposite.x) &&
        point.x < Math.max(origin.x, opposite.x) &&
        point.y > Math.min(origin.y, opposite.y) &&
        point.y < Math.max(origin.y, opposite.y)
      )
    }

    function resize(o, d) {
      switch (selectedEP.id) {
        case 0:
          origin = o;
          height = Math.round(Math.abs(height) - d.y);
          width = Math.round(Math.abs(width) - d.x);
          break;
        case 1:
          origin = { x: p1.x, y: p1.y + d.y };
          height = Math.round(Math.abs(height) - d.y);
          width = Math.abs(width);
          break;
        case 2:
          origin = o;
          height = Math.round((Math.abs(height)) - d.y);
          width = Math.round((Math.abs(width) * -1) - d.x);
          break;
        case 3:
          origin = p1;
          height = Math.abs(height);
          width = Math.round(Math.abs(width) + d.x);
          break;
        case 4:
          origin = o;
          height = Math.round((Math.abs(height) * -1) - d.y);
          width = Math.round((Math.abs(width) * -1) - d.x);
          break;
        case 5:
          origin = p1;
          height = Math.round(Math.abs(height) + d.y);
          width = Math.abs(width);
          break;
        case 6:
          origin = o;
          height = Math.round((Math.abs(height) * -1) - d.y);
          width = Math.round(Math.abs(width) - d.x);
          break;
        case 7:
          origin = { x: p1.x + d.x, y: p1.y };
          height = Math.abs(height);
          width = Math.round(Math.abs(width) - d.x);
          break;
        default:
          break;
      }

      opposite = _getOpposite(origin, width, height);
      _update();
    }

    function move(d) {
      origin = {
        x: origin.x + d.x,
        y: origin.y + d.y
      };
      opposite = _getOpposite(origin, width, height);
      _update();
    }

    function draw(o, w, h) {
      origin = o;
      height = h;
      width = w;
      opposite = _getOpposite(origin, width, height);
      _update();
    }

    function reset() {
      width = 0;
      height = 0;
      origin = {x: 0, y: 0};
      opposite = {x: 0, y: 0};
      _update();
    }

    function _update() {
      editPoints = [];

      // draw translucent background
      ctx.globalAlpha = globalAlpha;
      ctx.fillStyle = 'black';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // return when no bbox is drawn
      if (!width || !height) return;

      // draw transparent bbox
      ctx.clearRect(origin.x, origin.y, width, height);

      // calculate upper left corner to work as a coordenates reference
      p1 = _getUpperLeftCorner();
      p2 = _getBottomRightCorner();

      // corners
      editPoints.push(_createEditPoint({x: p1.x, y: p1.y}, 0, 'nwse-resize'));
      editPoints.push(_createEditPoint({x: p2.x, y: p1.y}, 2, 'nesw-resize'));
      editPoints.push(_createEditPoint({x: p2.x, y: p2.y}, 4, 'nwse-resize'));
      editPoints.push(_createEditPoint({x: p1.x, y: p2.y}, 6, 'nesw-resize'));

      // laterals
      if (!isMobile.phone) {
        editPoints.push(_createEditPoint({x: p2.x - Math.abs(width) / 2, y: p1.y}, 1, 'ns-resize'));
        editPoints.push(_createEditPoint({x: p2.x, y: p2.y - Math.abs(height) / 2}, 3, 'ew-resize'));
        editPoints.push(_createEditPoint({x: p2.x - Math.abs(width) / 2, y: p2.y}, 5, 'ns-resize'));
        editPoints.push(_createEditPoint({x: p1.x, y: p2.y - Math.abs(height) / 2}, 7, 'ew-resize'));
      }
    }

    function _createEditPoint(origin, id, style) {
      return EditPoint({ origin, id, style }).draw(ctx);
    }

    function _getOpposite(o, w, h) {
      return {
        x: Math.round(o.x + w),
        y: Math.round(o.y + h)
      };
    }

    function _getUpperLeftCorner() {
      return {
        x: Math.round(Math.max(Math.min(origin.x, opposite.x), 0)),
        y: Math.round(Math.max(Math.min(origin.y, opposite.y), 0))
      };
    }

    function _getBottomRightCorner() {
      return {
        x: Math.round(Math.min(Math.max(origin.x, opposite.x), canvas.width)),
        y: Math.round(Math.min(Math.max(origin.y, opposite.y), canvas.height))
      };
    }
  }
}
