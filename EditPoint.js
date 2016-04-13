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
    draw,
    id,
    style,
    x: origin.x,
    y: origin.y,
  }

  return ep;

  function draw(ctx) {
    ctx.save(); // save current ctx state

    // draw edit points
    ctx.globalAlpha = 1;
    ctx.fillStyle = EP.colors.background;
    ctx.strokeStyle = EP.colors.stroke;
    ctx.lineWidth = EP.lineWidth;

    // draw circle
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, EP.width / 2, 2 * Math.PI, false);
    ctx.stroke();
    ctx.fill();

    ctx.restore(); // restore ctx to the state before we applied our changes
    return ep;
  }
}
