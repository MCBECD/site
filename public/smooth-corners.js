// Fixed smooth-corners paint worklet (G2 continuous curvature)
// Source: https://github.com/wopian/smooth-corners (v1.1.0)
// Fix: property name mismatch in v2 painter

registerPaint("smooth-corners", class {
  static get inputProperties() {
    return ["--smooth-corners", "--smooth-corners-radius", "--smooth-corners-steps"];
  }

  superellipse(w, h, expX, expY, steps) {
    if (Number.isNaN(expX)) expX = 4;
    if (expY === undefined || Number.isNaN(expY)) expY = expX;
    expX = Math.max(1e-11, Math.min(100, expX));
    expY = Math.max(1e-11, Math.min(100, expY));
    const px = 2 / expX;
    const py = 2 / expY;
    const step = (2 * Math.PI) / steps;
    return Array.from({ length: steps }, (_, i) => {
      const angle = i * step;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: Math.abs(cos) ** px * w * Math.sign(cos),
        y: Math.abs(sin) ** py * h * Math.sign(sin)
      };
    });
  }

  paint(ctx, size, props) {
    const [expX, expY] = props.get("--smooth-corners")
      .toString().replace(/ /g, "").split(",").map(parseFloat);
    const cx = size.width / 2;
    const cy = size.height / 2;
    const maxR = Math.min(size.width, size.height) / 2;
    const radius = Math.min(
      parseFloat(props.get("--smooth-corners-radius")) || maxR,
      maxR
    );
    const steps = parseFloat(props.get("--smooth-corners-steps")) || 360;

    const pts = this.superellipse(radius, radius, expX, expY, steps);
    const dx = cx - radius;
    const dy = cy - radius;

    const mapped = [
      ...pts.slice(0, steps / 4).map(({ x, y }) => ({ x: x + dx, y: y + dy })),
      ...pts.slice(steps / 4, steps / 2).map(({ x, y }) => ({ x: x - dx, y: y + dy })),
      ...pts.slice(steps / 2, 3 * steps / 4).map(({ x, y }) => ({ x: x - dx, y: y - dy })),
      ...pts.slice(3 * steps / 4).map(({ x, y }) => ({ x: x + dx, y: y - dy }))
    ];

    ctx.fillStyle = "#000";
    ctx.setTransform(1, 0, 0, 1, cx, cy);
    ctx.beginPath();
    for (let i = 0; i < mapped.length; i++) {
      const { x, y } = mapped[i];
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }
});
