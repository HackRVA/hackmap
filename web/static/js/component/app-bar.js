export default class AppBar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.1/css/all.min.css" integrity="sha512-5Hs3dF2AEPkpNAR7UiOHba+lRSJNeM2ECkwxUIxC1Q/FLycGTbNapWXB4tP889k5T5Ju8fs4b1P5z/iB4nMfSQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<style>
/* Styling for the Orbitron font */
.orbitron {
  font-family: "Orbitron", sans-serif;
  font-weight: 700; /* You can set 400, 700, or 900 for different weights */
  font-style: normal;
}
.github-icon {
  font-size: 1.5rem;
  margin-left: 10px;
  color: white;
  transition: color 0.3s;
}
</style>
      <nav class="navbar is-primary" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
          <a class="navbar-item" href="/">
            <!--<img src="https://via.placeholder.com/150x50" alt="Logo">-->
            <h1 class="orbitron">hackmap</h1>
          </a>
          <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div id="navbarBasicExample" class="navbar-menu">
          <div class="navbar-start">
            <a class="navbar-item" href="/">
             Search
            </a>
            <a class="navbar-item" href="/edit">
             Edit
            </a>

          </div>

          <div class="navbar-end">
            <div class="navbar-item">
              <a href="https://github.com/hackrva/hackmap" target="_blank" aria-label="GitHub">
                <i class="fab fa-github github-icon"></i>
              </a>
            </div>
          </div>
        </div>
      </nav>
    `;

    this.querySelector(".navbar-burger").addEventListener("click", () => {
      const target = this.querySelector(".navbar-burger").dataset.target;
      const $target = this.querySelector(`#${target}`);
      this.querySelector(".navbar-burger").classList.toggle("is-active");
      $target.classList.toggle("is-active");
    });
  }
}

customElements.define("app-bar", AppBar);
