const NEWS_CACHE_KEY = "news_cache";
const NEWS_ETAG_KEY = "news_etag";

export class CacheService {
  static #isCacheAvailable() {
    try {
      const test = "__test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn("Cache service unavailable:", error.message);
      return false;
    }
  }

  static saveNewsToCache(news, etag) {
    if (!this.#isCacheAvailable()) return;
    try {
      localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(news));
      if (etag) {
        localStorage.setItem(NEWS_ETAG_KEY, etag);
      }
    } catch (error) {
      console.warn("Failed to save news cache:", error.message);
    }
  }

  static getNewsFromCache() {
    if (!this.#isCacheAvailable()) return null;
    try {
      const cachedNews = localStorage.getItem(NEWS_CACHE_KEY);
      return cachedNews ? JSON.parse(cachedNews) : null;
    } catch (error) {
      console.warn("Failed to read news cache:", error.message);
      return null;
    }
  }

  static getNewsEtag() {
    if (!this.#isCacheAvailable()) return null;
    try {
      return localStorage.getItem(NEWS_ETAG_KEY);
    } catch (error) {
      console.warn("Failed to read news etag:", error.message);
      return null;
    }
  }

  static clearNewsCache() {
    if (!this.#isCacheAvailable()) return;
    try {
      localStorage.removeItem(NEWS_CACHE_KEY);
      localStorage.removeItem(NEWS_ETAG_KEY);
    } catch (error) {
      console.warn("Failed to clear news cache:", error.message);
    }
  }

  static hasValidCache() {
    return this.getNewsFromCache() !== null && this.getNewsEtag() !== null;
  }
}
