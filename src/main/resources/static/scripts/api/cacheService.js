const NEWS_CACHE_KEY = 'news_cache';
const NEWS_ETAG_KEY = 'news_etag';

export class CacheService {

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

    static getNewsFromCache() {
        const cachedNews = localStorage.getItem(NEWS_CACHE_KEY);
        return cachedNews ? JSON.parse(cachedNews) : null;
    }

    static getNewsEtag() {
        return localStorage.getItem(NEWS_ETAG_KEY);
    }

    static clearNewsCache() {
        localStorage.removeItem(NEWS_CACHE_KEY);
        localStorage.removeItem(NEWS_ETAG_KEY);
    }

    static hasValidCache() {
        return this.getNewsFromCache() !== null && this.getNewsEtag() !== null;
    }
}