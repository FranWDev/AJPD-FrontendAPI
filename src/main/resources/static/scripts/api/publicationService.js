import { CacheService } from './cacheService.js';

export async function fetchNewsSummary() {
    // Intentar obtener noticias de la caché
    const cachedNews = CacheService.getNewsFromCache();
    const cacheTimestamp = CacheService.getNewsCacheTimestamp();
    
    try {
        // Si no hay caché, hacer petición normal
        if (!cachedNews || !cacheTimestamp) {
            const response = await fetch('/api/news');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const news = await response.json();
            CacheService.saveNewsToCache(news);
            return news;
        }

        // Si hay caché, verificar si hay actualizaciones
        const lastModifiedResponse = await fetch('/api/news/last', {
            headers: {
                'If-Modified-Since': cacheTimestamp
            }
        });

        // Si el servidor devuelve 304 Not Modified, usar la caché
        if (lastModifiedResponse.status === 304) {
            return cachedNews;
        }

        // Si hay nuevas noticias, actualizar la caché
        if (lastModifiedResponse.ok) {
            const response = await fetch('/api/news');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const news = await response.json();
            CacheService.saveNewsToCache(news);
            return news;
        }

        // Si hay algún error, devolver la caché como fallback
        return cachedNews;
    } catch (error) {
        console.error('Error fetching news:', error);
        // Si hay un error de red, usar la caché como fallback
        if (cachedNews) {
            return cachedNews;
        }
        throw error;
    }
}
export async function fetchActivitiesSummary() {
    const response = await fetch('/api/activities');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}
export async function fetchFeaturedSummary() {
    const response = await fetch('/api/featured');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return await response.json();
}

