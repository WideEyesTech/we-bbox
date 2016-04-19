const corners = [ 0, 2, 4, 6 ]

const EP = {
  colors: {
    background: '#333',
    stroke: 'white'
  },
  lineWidth: 3,
  width: 8
};

export default function EditPoint({origin, id, style}) {
  const ep = {
    id,
    draw,
    style,
    x: origin.x,
    y: origin.y
  }

  return ep;

  function draw(ctx) {
    if (corners.indexOf(id) > -1) {
      return drawCorner(ctx, style)
    } else {
      return drawLateral(ctx)
    }
  }

  function drawCorner(ctx) {
    const W = 30
    const S = 8

    ctx.save(); // save current ctx state

    // draw edit points
    ctx.globalAlpha = 1;
    ctx.fillStyle = EP.colors.background;
    ctx.strokeStyle = EP.colors.stroke;
    ctx.lineWidth = EP.lineWidth;

    ctx.translate(0.5, 0.5);
    ctx.beginPath();
    switch (id) {
      case 0:
        ctx.moveTo(origin.x + 1, origin.y + W)
        ctx.lineTo(origin.x + 1, origin.y + 1);
        ctx.lineTo(origin.x + 1 + W, origin.y + 1);
        ctx.lineTo(origin.x + 1 + W, origin.y + S);
        ctx.lineTo(origin.x + 1 + S, origin.y + S);
        ctx.lineTo(origin.x + 1 + S, origin.y + W);
        ctx.lineTo(origin.x, origin.y + W);
        break;
      case 2:
        ctx.moveTo(origin.x - 1, origin.y + W)
        ctx.lineTo(origin.x - 1, origin.y + 1);
        ctx.lineTo(origin.x - 1 - W, origin.y + 1);
        ctx.lineTo(origin.x - 1 - W, origin.y + S);
        ctx.lineTo(origin.x - 1 - S, origin.y + S);
        ctx.lineTo(origin.x - 1 - S, origin.y + W);
        ctx.lineTo(origin.x, origin.y + W);
        break;
      case 4:
        ctx.moveTo(origin.x - 1, origin.y - W)
        ctx.lineTo(origin.x - 1, origin.y - 1);
        ctx.lineTo(origin.x - W, origin.y - 1);
        ctx.lineTo(origin.x - W, origin.y - S);
        ctx.lineTo(origin.x - S, origin.y - S);
        ctx.lineTo(origin.x - S, origin.y - W);
        ctx.lineTo(origin.x, origin.y - W);
        break;
      case 6:
        ctx.moveTo(origin.x + 1, origin.y - W)
        ctx.lineTo(origin.x + 1, origin.y - 1);
        ctx.lineTo(origin.x + W, origin.y - 1);
        ctx.lineTo(origin.x + W, origin.y - S);
        ctx.lineTo(origin.x + S, origin.y - S);
        ctx.lineTo(origin.x + S, origin.y - W);
        ctx.lineTo(origin.x, origin.y - W);
        break;
      default:

    }

    ctx.fill()
    ctx.stroke()

    ctx.closePath();
    ctx.restore(); // restore ctx to the state before we applied our changes
    return ep;
  }

  function drawLateral(ctx) {
    ctx.save(); // save current ctx state

    // draw edit points
    ctx.globalAlpha = 1;
    ctx.fillStyle = EP.colors.background;
    ctx.strokeStyle = EP.colors.stroke;
    ctx.lineWidth = EP.lineWidth;

    ctx.beginPath();

    ctx.arc(origin.x, origin.y, EP.width / 2, 2 * Math.PI, false);
    ctx.stroke();
    ctx.fill();

    ctx.closePath();
    ctx.restore(); // restore ctx to the state before we applied our changes
    return ep;
  }
}
