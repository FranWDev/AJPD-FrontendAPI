import { fetchNewsSummary, normalizeTitle } from "../api/publicationService.js";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".featured-section .container");

  if (!container) {
    console.error("No se encontró el contenedor .featured-section .container");
    return;
  }

  const programCards = document.createElement("div");
  programCards.classList.add("program-cards");
  container.appendChild(programCards);

  fetchNewsSummary()
    .then((data) => {

      data.slice(0, 3).forEach(async (item) => {

        const article = document.createElement("article");
        article.classList.add("program-card");
        article.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.title}">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <a href="/noticias-y-actividades/${await normalizeTitle(item.title)}" class="learn-more read-more">Saber más →</a>
            `;

        programCards.appendChild(article);
      });
    })
    .catch((err) => {
      console.error("Error al cargar las noticias:", err);
    });
});
