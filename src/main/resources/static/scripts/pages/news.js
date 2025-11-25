import { fetchNewsSummary, normalizeTitle } from "../api/publicationService.js";
import edjsHTML from "../components/EditorJSParser.js";
import { sanitizeTitle, initializePopups } from "../components/popup.js";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementsByClassName("program-cards");

  fetchNewsSummary().then((data) => {
    const parser = edjsHTML();

    data.forEach(async (item, index) => {
      const article = document.createElement("article");
      article.classList.add("program-card")

      article.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.title}">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <a href="/noticias-y-actividades/${await normalizeTitle(
                  item.title
                )}" id="${sanitizeTitle(
        item.title
      )}" class="learn-more read-more">Saber más →</a>
            `;

      const learnMore = document.createElement("div");

      container[0].appendChild(learnMore);
      container[0].appendChild(article);
    });
  });
});
