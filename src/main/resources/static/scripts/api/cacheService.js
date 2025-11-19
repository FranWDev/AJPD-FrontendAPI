const NEWS_CACHE_KEY = 'news_cache';
const NEWS_TIMESTAMP_KEY = 'news_cache_timestamp';

export class CacheService {
    static saveNewsToCache(news) {
        localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(news));
        localStorage.setItem(NEWS_TIMESTAMP_KEY, new Date().toISOString());
    }

    static getNewsFromCache() {
        const cachedNews = localStorage.getItem(NEWS_CACHE_KEY);
        return cachedNews ? JSON.parse(cachedNews) : null;
    }

    static getNewsCacheTimestamp() {
        return localStorage.getItem(NEWS_TIMESTAMP_KEY);
    }

    static clearNewsCache() {
        localStorage.removeItem(NEWS_CACHE_KEY);
        localStorage.removeItem(NEWS_TIMESTAMP_KEY);
    }
}