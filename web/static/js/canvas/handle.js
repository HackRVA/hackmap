export class Handle {
  constructor(type, x, y, radius = 6) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  containsPoint(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.getFillColor();
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.closePath();
  }

  getFillColor() {
    return this.type === "rotate" ? "red" : "white";
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
}
