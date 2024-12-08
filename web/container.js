import { Rect } from "./rect.js";
import { Handle } from "./handle.js";

const PIXELS_PER_INCH = 2;

export class Container {
  constructor(
    id,
    x,
    y,
    width,
    height,
    label,
    rotation = 0,
    wikiPage = "",
    description = "",
    imageUrl = "",
  ) {
    this.id = id;
    this.rect = new Rect(id, x, y, width, height, label, rotation);
    this.resizeHandle = new Handle("resize", 0, 0);
    this.rotationHandle = new Handle("rotate", 0, 0);
    this.wikiPage = wikiPage;
    this.description = description;
    this.imageUrl = imageUrl;
    this.updateHandles();
  }

  updateHandles() {
    const cos = Math.cos((this.rect.rotation * Math.PI) / 180);
    const sin = Math.sin((this.rect.rotation * Math.PI) / 180);

    this.updateResizeHandlePosition(cos, sin);
    this.updateRotationHandlePosition(cos, sin);
  }

  updateResizeHandlePosition(cos, sin) {
    const resizeX =
      this.rect.x + (this.rect.width * PIXELS_PER_INCH) * cos - (this.rect.height * PIXELS_PER_INCH) * sin;
    const resizeY =
      this.rect.y + (this.rect.width * PIXELS_PER_INCH) * sin + (this.rect.height * PIXELS_PER_INCH) * cos;
    this.resizeHandle.setPosition(resizeX, resizeY);
  }

  updateRotationHandlePosition(cos, sin) {
    const rotateX = this.rect.x + (this.rect.width * PIXELS_PER_INCH / 2) * cos - (this.rect.height * PIXELS_PER_INCH / 2 + 30) * sin;
    const rotateY = this.rect.y + (this.rect.width * PIXELS_PER_INCH / 2) * sin + (this.rect.height * PIXELS_PER_INCH / 2 + 30) * cos;
    this.rotationHandle.setPosition(rotateX, rotateY);
  }

  containsPoint(x, y) {
    return this.rect.containsPoint(x, y);
  }

  handleMouseDown(x, y) {
    if (this.rotationHandle.containsPoint(x, y)) {
      return "rotate";
    }

    if (this.resizeHandle.containsPoint(x, y)) {
      return "resize";
    }

    if (this.rect.containsPoint(x, y)) {
      return "drag";
    }

    return null;
  }

  handleMouseMove(x, y, action, dragOffset) {
    if (action === "drag") {
      this.rect.move(x - dragOffset.x, y - dragOffset.y);
    } else if (action === "rotate") {
      this.rotateRect(x, y);
    } else if (action === "resize") {
      this.resizeRect(x, y);
    }

    this.updateHandles();
  }

  rotateRect(x, y) {
    const dx = x - this.rect.x;
    const dy = y - this.rect.y;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const snapAngle = 15;
    angle = Math.round(angle / snapAngle) * snapAngle;

    this.rect.setRotation(angle);
  }

  resizeRect(x, y) {
    const cos = Math.cos((this.rect.rotation * Math.PI) / 180);
    const sin = Math.sin((this.rect.rotation * Math.PI) / 180);

    const dx = x - this.rect.x;
    const dy = y - this.rect.y;
    const localX = dx * cos + dy * sin;
    const localY = -dx * sin + dy * cos;

    const newWidth = Math.max(0.01, Math.abs(localX) / PIXELS_PER_INCH);
    const newHeight = Math.max(0.01, Math.abs(localY) / PIXELS_PER_INCH);

    this.rect.resize(newWidth, newHeight);
  }

  draw(ctx, highlight = false, showHandles = false) {
    this.rect.draw(ctx, highlight, showHandles);
    if (showHandles) {
      this.resizeHandle.draw(ctx);
      this.rotationHandle.draw(ctx);
    }
  }
}
