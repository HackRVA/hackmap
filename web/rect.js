export class Rect {
  constructor(id, x, y, width, height, label, rotation = 0) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.label = label;
    this.rotation = rotation;
  }

  containsPoint(x, y) {
    const cos = Math.cos((this.rotation * Math.PI) / 180);
    const sin = Math.sin((this.rotation * Math.PI) / 180);
    const dx = x - this.x;
    const dy = y - this.y;

    const localX = dx * cos + dy * sin;
    const localY = -dx * sin + dy * cos;

    return (
      localX >= 0 &&
      localX <= this.width &&
      localY >= 0 &&
      localY <= this.height
    );
  }

  move(newX, newY) {
    this.x = newX;
    this.y = newY;
  }

  resize(newWidth, newHeight) {
    this.width = Math.max(1, newWidth);
    this.height = Math.max(1, newHeight);
  }

  setRotation(rotation) {
    this.rotation = rotation % 360;
  }

  draw(ctx, highlight = false) {
    ctx.save();

    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);

    this.drawRect(ctx, highlight);
    this.drawLabel(ctx);

    ctx.restore();
  }

  drawRect(ctx, highlight) {
    ctx.beginPath();
    ctx.rect(0, 0, this.width, this.height);
    ctx.fillStyle = highlight ? "rgba(255, 255, 0, 0.5)" : "white";
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.closePath();
  }

  drawLabel(ctx) {
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    const textWidth = ctx.measureText(this.label).width;
    const textX = this.width / 2 - textWidth / 2;
    const textY = this.height / 2 + 8;
    ctx.fillText(this.label, textX, textY);
  }
}
