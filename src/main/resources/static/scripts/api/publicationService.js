import { CacheService } from './cacheService.js';

export async function fetchNewsSummary() {
    const cachedNews = CacheService.getNewsFromCache();
    const cacheTimestamp = CacheService.getNewsCacheTimestamp();
    
    try {
        if (!cachedNews || !cacheTimestamp) {
            const response = await fetch('/api/news');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const news = await response.json();
            CacheService.saveNewsToCache(news);
            return news;
        }

        const lastModifiedResponse = await fetch('/api/news/last', {
            headers: {
                'If-Modified-Since': cacheTimestamp
            }
        });

        if (lastModifiedResponse.status === 304) {
            return cachedNews;
        }

        if (lastModifiedResponse.ok) {
            const response = await fetch('/api/news');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const news = await response.json();
            CacheService.saveNewsToCache(news);
            return news;
        }

        return cachedNews;
    } catch (error) {
        console.error('Error fetching news:', error);
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

