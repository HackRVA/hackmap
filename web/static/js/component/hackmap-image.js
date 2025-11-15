import { ensureFontAwesomeLoaded } from "../utils/font-awesome.js";

export default class HackMapImage extends HTMLElement {
  constructor() {
    super();
    this._src = "";
  }

  connectedCallback() {
    this.render();
  }

  static get observedAttributes() {
    return ["src", "width", "height", "alt"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "src") {
      this._src = newValue;
      this.render();
    }
  }

  get src() {
    return this._src;
  }

  set src(value) {
    if (value) {
      this.setAttribute("src", value);
    } else {
      this.removeAttribute("src");
    }
    this._src = value;
    this.render();
  }

  render() {
    const width = this.getAttribute("width") || "100px";
    const height = this.getAttribute("height") || "100px";
    const alt = this.getAttribute("alt") || "Image";

    if (this._src) {
      this.innerHTML = `
        <img src="${this._src}" alt="${alt}" style="max-width: ${width}; max-height: ${height};">
      `;
      return;
    }

    ensureFontAwesomeLoaded();
    this.innerHTML = `
      <div class="box has-background-light has-text-centered" style="width: ${width}; height: ${height}; display: flex; align-items: center; justify-content: center;">
        <span class="icon is-medium has-text-grey-light">
          <i class="fas fa-image fa-2x"></i>
        </span>
      </div>
    `;
  }
}

customElements.define("hackmap-image", HackMapImage);
