import { fetchNewsSummary } from "../api/publicationService.js";

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementsByClassName("program-cards");
    fetchNewsSummary().then(data => {
        console.log(data);
        data.forEach(item => {
            const article = document.createElement("article");
            article.classList.add("program-card");
            article.innerHTML = `
                <img src="${item.imageUrl}" alt="${item.title}">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <a href="${item.url}" target="_blank">Read more</a>
            `;
            container[0].appendChild(article);
        });
    })
})