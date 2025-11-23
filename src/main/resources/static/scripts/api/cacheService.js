const NEWS_CACHE_KEY = 'news_cache';
const NEWS_ETAG_KEY = 'news_etag';

export class CacheService {
    /**
     * Guarda las noticias y su ETag en localStorage
     * @param {Array} news - Array de noticias
     * @param {string} etag - ETag recibido del servidor
     */
    static saveNewsToCache(news, etag) {
        
        try {
            localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(news));
            
            if (etag) {
                localStorage.setItem(NEWS_ETAG_KEY, etag);
            } else {

            }
        } catch (error) {

        }
    }

    /**
     * Obtiene las noticias desde localStorage
     * @returns {Array|null} Array de noticias o null si no existe
     */
    static getNewsFromCache() {
        const cachedNews = localStorage.getItem(NEWS_CACHE_KEY);
        return cachedNews ? JSON.parse(cachedNews) : null;
    }

    /**
     * Obtiene el ETag guardado
     * @returns {string|null} ETag o null si no existe
     */
    static getNewsEtag() {
        return localStorage.getItem(NEWS_ETAG_KEY);
    }

    /**
     * Limpia la caché de noticias y su ETag
     */
    static clearNewsCache() {
        localStorage.removeItem(NEWS_CACHE_KEY);
        localStorage.removeItem(NEWS_ETAG_KEY);
    }

    /**
     * Verifica si existe caché válida
     * @returns {boolean} true si hay datos y ETag en caché
     */
    static hasValidCache() {
        return this.getNewsFromCache() !== null && this.getNewsEtag() !== null;
    }
}