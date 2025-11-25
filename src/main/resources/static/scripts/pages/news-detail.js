import { fetchNewsByTitle } from "../api/publicationService.js";
import edjsHTML from "../components/EditorJSParser.js";

document.addEventListener("DOMContentLoaded", () => {
    // Obtener el título de la URL
    const path = window.location.pathname;
    const urlTitle = path.split('/').pop();
    
    if (!urlTitle) {
        window.location.href = '/noticias-y-actividades';
        return;
    }

    const h1 = document.querySelector('.featured-section h1');
    const container = document.getElementById('news-container');
    
    // Cargar la noticia
    fetchNewsByTitle(urlTitle)
        .then(news => {
            // Actualizar título de la página y h1
            document.title = `AJPD - ${news.title}`;
            h1.textContent = news.title;
            
            // Parsear el contenido de EditorJS
            const parser = edjsHTML();
            const htmlContent = parser.parse(news.editorContent);
            
            // Renderizar en el container
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
            h1.textContent = 'Noticia no encontrada';
            container.innerHTML = `
                <p>Lo sentimos, no se pudo cargar la noticia solicitada.</p>
                <a href="/noticias-y-actividades" class="btn">Volver a noticias</a>
            `;
            // Redirigir después de 3 segundos
            setTimeout(() => {
                window.location.href = '/noticias-y-actividades';
            }, 3000);
        });
});
