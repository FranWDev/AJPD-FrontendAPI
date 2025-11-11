const NEWS_CACHE_KEY = "news_cache";
const NEWS_ETAG_KEY = "news_cache_etag";

export class CacheService {
  static saveNewsToCache(news, etag) {
    localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(news));
    if (etag) localStorage.setItem(NEWS_ETAG_KEY, etag);
  }

  static getNewsFromCache() {
    const cachedNews = localStorage.getItem(NEWS_CACHE_KEY);
    return cachedNews ? JSON.parse(cachedNews) : null;
  }

  static getNewsCacheEtag() {
    return localStorage.getItem(NEWS_ETAG_KEY);
  }

  static clearNewsCache() {
    localStorage.removeItem(NEWS_CACHE_KEY);
    localStorage.removeItem(NEWS_ETAG_KEY);
  }
}
