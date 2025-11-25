import { fetchNewsByTitle } from "../api/publicationService.js";
import edjsHTML from "../components/EditorJSParser.js";

document.addEventListener("DOMContentLoaded", () => {

    const path = window.location.pathname;
    const urlTitle = path.split('/').pop();
    
    if (!urlTitle) {
        window.location.href = '/noticias-y-actividades';
        return;
    }

    const container = document.getElementById('news-container');
    
    fetchNewsByTitle(urlTitle)
        .then(news => {

            document.title = `AJPD - ${news.title}`;

            const parser = edjsHTML();
            const htmlContent = parser.parse(news.editorContent);
 
            container.innerHTML = `
                <article class="news-detail">
                    ${news.imageUrl ? `<img src="${news.imageUrl}" alt="${news.title}" class="news-image">` : ''}
                    <h2>${news.title}</h2>
                    <div class="news-content">
                        ${htmlContent}
                    </div>
                </article>
            `;
        })
        .catch(error => {
            console.error('Error al cargar la noticia:', error);
            container.innerHTML = `
                <p>Lo sentimos, no se pudo cargar la noticia solicitada.</p>
                <a href="/noticias-y-actividades" class="btn">Volver a noticias</a>
            `;

            setTimeout(() => {
                window.location.href = '/noticias-y-actividades';
            }, 3000);
        });
});
