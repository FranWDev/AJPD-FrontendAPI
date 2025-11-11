import { CacheService } from "./cacheService.js";

export async function fetchNewsSummary() {
  const cachedNews = CacheService.getNewsFromCache();
  const cachedEtag = CacheService.getNewsCacheEtag();

  try {
    const headResponse = await fetch("/api/news/last", {
      method: "HEAD",
      headers: cachedEtag ? { "If-None-Match": cachedEtag } : {},
      cache: "no-store",
    });

    const serverEtag = headResponse.headers.get("ETag");

    if (headResponse.status === 304 && cachedNews) {
      return cachedNews;
    }

    const response = await fetch("/api/news");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const news = await response.json();
    CacheService.saveNewsToCache(news, serverEtag);
    return news;
  } catch (error) {
    console.error("Error fetching news:", error);
    if (cachedNews) return cachedNews;
    throw error;
  }
}

export async function fetchActivitiesSummary() {
  const response = await fetch("/api/activities");
  if (!response.ok) throw new Error("Network response was not ok");
  return await response.json();
}

export async function fetchFeaturedSummary() {
  const response = await fetch("/api/featured");
  if (!response.ok) throw new Error("Network response was not ok");
  return await response.json();
}
