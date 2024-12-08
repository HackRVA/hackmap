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
    this.innerHTML = '';
    this.results.forEach(result => {
      const div = document.createElement('div');
      div.className = 'column is-full';
      div.innerHTML = `
        <div class="card result-card">
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-4">${result.name}</p>
                <p class="subtitle is-6">Container: ${result.label}</p>
                ${result.wikiUrl && result.wikiUrl !== '#' ? `<p class="subtitle is-6">Wiki Page: <a href="${result.wikiUrl}" target="_blank">${result.wikiUrl}</a></p>` : ''}
              </div>
            </div>
            <div class="content">${result.description}</div>
          </div>
          <div class="card-image">
            <figure class="image">
              <img src="${result.containerImageUrl || 'https://via.placeholder.com/150'}" alt="Item Image" class="tiny-image">
            </figure>
          </div>
        </div>
      `;
      this.appendChild(div);

      const tinyImage = div.querySelector('.tiny-image');
      tinyImage.addEventListener('click', () => this.showModal(result.containerImageUrl));
    });

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <span class="close">&times;</span>
      <img class="modal-content">
    `;
    this.appendChild(modal);

    const closeModal = () => {
      modal.style.display = 'none';
    };

    modal.addEventListener('click', closeModal);
    modal.querySelector('.close').addEventListener('click', closeModal);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    });
  }

  showModal(imageUrl) {
    const modal = this.querySelector('.modal');
    const modalContent = modal.querySelector('.modal-content');
    modalContent.src = imageUrl;
    modal.style.display = 'block';
  }
}

customElements.define('search-results', SearchResults);
