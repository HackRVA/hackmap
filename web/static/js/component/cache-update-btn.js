export default class CacheUpdateButton extends HTMLElement {
  constructor() {
    super();
    this.cacheInfo = null;
  }

  async fetchCacheInfo() {
    try {
      const response = await fetch(`/cache/info`);
      if (response.ok) {
        this.cacheInfo = await response.json();
      } else {
        console.error("Failed to fetch cache info");
      }
    } catch (error) {
      console.error("Error fetching cache info:", error);
    }
  }

  showPopover(event) {
    if (!this.cacheInfo) return;

    const popover = document.createElement("div");
    popover.id = "cache-info-popover";
    popover.style.position = "absolute";
    popover.style.backgroundColor = "#fff";
    popover.style.border = "1px solid #ccc";
    popover.style.padding = "10px";
    popover.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
    popover.style.zIndex = "1000";

    const containerInfo = this.cacheInfo.containers;
    const itemInfo = this.cacheInfo.items;

    popover.innerHTML = `
      <div><strong>Containers:</strong></div>
      <div>Count: ${containerInfo.count}</div>
      <div>Updated: ${new Date(containerInfo.updated).toLocaleString()}</div>
      <div><strong>Items:</strong></div>
      <div>Count: ${itemInfo.count}</div>
      <div>Updated: ${new Date(itemInfo.updated).toLocaleString()}</div>
    `;

    document.body.appendChild(popover);

    const rect = event.target.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    popover.style.top = `${rect.top + window.scrollY - popoverRect.height}px`;
    popover.style.left = `${rect.left + window.scrollX - popoverRect.width}px`;
  }

  hidePopover() {
    const popover = document.getElementById("cache-info-popover");
    if (popover) {
      popover.remove();
    }
  }

  async connectedCallback() {
    this.innerHTML = `<button id="cache-update-btn" class="button">update cache</button>`;

    await this.fetchCacheInfo();

    const button = this.querySelector("#cache-update-btn");

    button.addEventListener("click", async () => {
      console.log("hello");
      const response = await fetch(`/cache/refresh`, {
        method: "POST",
      });
      console.log(response);
      await this.fetchCacheInfo();
    });

    button.addEventListener("mouseenter", this.showPopover.bind(this));
    button.addEventListener("mouseleave", this.hidePopover.bind(this));
  }
}

customElements.define("cache-update-button", CacheUpdateButton);
