import { fetchFeaturedSummary } from "../api/publicationService.js";
import edjsHTML from "../components/EditorJSParser.js";
import { sanitizeTitle, initializePopups } from "../components/popup.js";

document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".featured-section .container");

    const programCards = document.createElement("div");
    programCards.classList.add("program-cards");
    container.appendChild(programCards);

    fetchFeaturedSummary().then((data) => {
        const parser = edjsHTML();

        data.slice(0, 3).forEach((item) => {
            const article = document.createElement("article");
            article.classList.add("program-card");
            article.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.title}">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <a href="#" id="${sanitizeTitle(item.title)}" class="learn-more read-more">Saber más →</a>
            `;

            const learnMore = document.createElement("div");
            learnMore.classList.add("popup-overlay");
            learnMore.id = "overlay-" + sanitizeTitle(item.title);

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
            learnMore.appendChild(popupContent);

            programCards.appendChild(article);
            container.appendChild(learnMore);
        });

        initializePopups();
    });
});
