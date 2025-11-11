import { fetchNewsSummary } from "../api/publicationService.js";
import edjsHTML from "../components/EditorJSParser.js";
import { sanitizeTitle, initializePopups } from "../components/popup.js";

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
      const parser = edjsHTML();

      data.slice(0, 3).forEach((item) => {
        const popup = document.createElement("div");
        popup.classList.add("popup-overlay");
        popup.id = "overlay-" + sanitizeTitle(item.title);

        const popupContent = document.createElement("div");
        popupContent.classList.add("popup-content");
        popupContent.id = "popup-content-" + sanitizeTitle(item.title);

        const popupHeader = document.createElement("div");
        popupHeader.innerHTML = `
                <h2>${item.title}</h2>
                <button aria-label="Cerrar">&times;</button>
            `;

        const popupBody = document.createElement("div");
        popupBody.innerHTML = parser.parse(item.editorContent);

        popupContent.appendChild(popupHeader);
        popupContent.appendChild(popupBody);
        popup.appendChild(popupContent);

        const article = document.createElement("article");
        article.classList.add("program-card");
        article.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.title}">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <a href="#" id="${sanitizeTitle(
                  item.title
                )}" class="learn-more read-more">Saber más →</a>
            `;

        document.body.appendChild(popup);
        programCards.appendChild(article);
      });

      initializePopups();
    })
    .catch((err) => {
      console.error("Error al cargar las noticias:", err);
    });
});
