import { Handle } from "./handle.js";

export class Rect {
  constructor(id, x, y, width, height, label, rotation = 0) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.label = label;
    this.rotation = rotation;

    this.resizeHandle = new Handle("resize", 0, 0);
    this.rotationHandle = new Handle("rotate", 0, 0);

    this.updateHandles();
  }

  updateHandles() {
    const cos = Math.cos((this.rotation * Math.PI) / 180);
    const sin = Math.sin((this.rotation * Math.PI) / 180);

    this.updateResizeHandlePosition(cos, sin);
    this.updateRotationHandlePosition(cos, sin);
  }

  updateResizeHandlePosition(cos, sin) {
    const resizeX = this.x + (this.width / 2) * cos - (this.height / 2) * sin;
    const resizeY = this.y + (this.width / 2) * sin + (this.height / 2) * cos;
    this.resizeHandle.setPosition(resizeX, resizeY);
  }

  updateRotationHandlePosition(cos, sin) {
    const rotateX = this.x - (this.height / 2 + 30) * sin;
    const rotateY = this.y - (this.height / 2 + 30) * cos;
    this.rotationHandle.setPosition(rotateX, rotateY);
  }

  containsPoint(x, y) {
    const cos = Math.cos((this.rotation * Math.PI) / 180);
    const sin = Math.sin((this.rotation * Math.PI) / 180);
    const dx = x - this.x;
    const dy = y - this.y;

    const localX = dx * cos + dy * sin;
    const localY = -dx * sin + dy * cos;

    return (
      Math.abs(localX) <= this.width / 2 && Math.abs(localY) <= this.height / 2
    );
  }

  move(newX, newY) {
    this.x = newX;
    this.y = newY;
    this.updateHandles();
  }

  resize(newWidth, newHeight) {
    this.width = Math.max(1, newWidth);
    this.height = Math.max(1, newHeight);
    this.updateHandles();
  }

  setRotation(rotation) {
    this.rotation = rotation % 360;
    this.updateHandles();
  }

  draw(ctx, highlight = false, showHandles = false) {
    ctx.save();

    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);

    this.drawRect(ctx, highlight);
    this.drawLabel(ctx);

    ctx.restore();

    if (showHandles) {
      this.resizeHandle.draw(ctx);
      this.rotationHandle.draw(ctx);
    }
  }

  drawRect(ctx, highlight) {
    ctx.beginPath();
    ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
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
    const textX = -textWidth / 2;
    const textY = 8;
    ctx.fillText(this.label, textX, textY);
  }
}
