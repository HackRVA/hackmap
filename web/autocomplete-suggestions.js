class AutocompleteSuggestions extends HTMLElement {
  constructor() {
    super();
    this.suggestions = [];
  }

  setSuggestions(suggestions) {
    this.suggestions = suggestions;
    this.render();
  }

  render() {
    this.innerHTML = '';
    this.suggestions.forEach(suggestion => {
      const div = document.createElement('div');
      div.className = 'autocomplete-suggestion';
      div.textContent = suggestion.name;
      div.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('suggestion-click', { detail: suggestion }));
        const searchBar = document.querySelector('search-bar');
        searchBar.dispatchEvent(new CustomEvent('search-enter', { detail: suggestion.name.toLowerCase() }));
      });
      this.appendChild(div);
    });
  }
}

customElements.define('autocomplete-suggestions', AutocompleteSuggestions);
