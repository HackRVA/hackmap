class SearchBar extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
      <div class="field">
        <div class="control">
          <input id="search-bar" class="input" type="text" placeholder="Search for items...">
        </div>
      </div>
    `;
  }

  connectedCallback() {
    const searchBar = this.querySelector("#search-bar");
    searchBar.addEventListener("input", this.onInput.bind(this));
    searchBar.addEventListener("keypress", this.onKeyPress.bind(this));
    searchBar.addEventListener("keydown", this.onKeyDown.bind(this));
  }

  onInput(event) {
    const query = event.target.value.toLowerCase();
    this.dispatchEvent(new CustomEvent("search-input", { detail: query }));
  }

  onKeyPress(event) {
    if (event.key === "Enter") {
      const query = event.target.value.toLowerCase();
      this.dispatchEvent(new CustomEvent("search-enter", { detail: query }));
    }
  }

  onKeyDown(event) {
    if (event.key === "Tab") {
      event.preventDefault();
      this.dispatchEvent(new CustomEvent("search-tab"));
    }
  }
}

customElements.define("search-bar", SearchBar);
