import { ensureFontAwesomeLoaded } from "../utils/font-awesome.js";

class SearchResults extends HTMLElement {
  constructor() {
    super();
    this.results = [];
  }

  setResults(results) {
    this.results = results;
    this.render();
  }

  render() {
    this.innerHTML = "";
    ensureFontAwesomeLoaded();

    this.results.forEach((result) => {
      const div = document.createElement("div");
      div.className = "column is-full";

      const typeInfo = result.type ? `<p class="subtitle is-6">Type: ${result.type}</p>` : "";
      const containerInfo = result.label ? `<p class="subtitle is-6">Container: ${result.label}</p>` : "";

      const imageContent = result.containerImageUrl
        ? `<figure class="image">
             <img src="${result.containerImageUrl}" alt="Container Image" class="tiny-image clickable-image">
           </figure>`
        : `<div class="box has-background-light has-text-centered image-placeholder" style="width: 150px; height: 150px; display: flex; align-items: center; justify-content: center;">
             <span class="icon is-large has-text-grey-light">
               <i class="fas fa-image fa-3x"></i>
             </span>
           </div>`;

      div.innerHTML = `
        <div class="card result-card">
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-4">${result.name}</p>
                ${typeInfo}
                ${containerInfo}
                ${result.wikiUrl && result.wikiUrl !== "#" ? `<p class="subtitle is-6">Wiki Page: <a href="${result.wikiUrl}" target="_blank">${result.wikiUrl}</a></p>` : ""}
              </div>
            </div>
            <div class="content">${result.description || ""}</div>
          </div>
          <div class="card-image">
            ${imageContent}
          </div>
        </div>
      `;
      this.appendChild(div);

      if (result.containerImageUrl) {
        const tinyImage = div.querySelector(".clickable-image");
        tinyImage.addEventListener("click", () =>
          this.showModal(result.containerImageUrl),
        );
      }
    });

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <span class="close">&times;</span>
      <img class="modal-content">
    `;
    this.appendChild(modal);

    const closeModal = () => {
      modal.style.display = "none";
    };

    modal.addEventListener("click", closeModal);
    modal.querySelector(".close").addEventListener("click", closeModal);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    });
  }

  showModal(imageUrl) {
    const modal = this.querySelector(".modal");
    const modalContent = modal.querySelector(".modal-content");
    modalContent.src = imageUrl;
    modal.style.display = "block";
  }
}

customElements.define("search-results", SearchResults);
