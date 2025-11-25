import { CacheService } from "./cacheService.js";

export async function fetchNewsSummary() {
  const cachedNews = CacheService.getNewsFromCache();
  const cacheEtag = CacheService.getNewsEtag();

  if (cachedNews) {
    updateNewsCache(cacheEtag).catch((err) =>
      console.error("Error updating cache:", err)
    );
    return cachedNews;
  }

  try {
    const response = await fetch("/api/news");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const news = await response.json();
    const etag = response.headers.get("ETag");
    CacheService.saveNewsToCache(news, etag);
    return news;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
}

async function updateNewsCache(cacheEtag) {
  try {
    const lastModifiedResponse = await fetch("/api/news/last", {
      method: "HEAD",
      headers: {
        "If-None-Match": cacheEtag,
      },
      cache: "no-store",
    });

    if (lastModifiedResponse.status === 304) {
      return;
    }

    if (lastModifiedResponse.ok) {
      const response = await fetch("/api/news");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const news = await response.json();
      const etag = response.headers.get("ETag");
      CacheService.saveNewsToCache(news, etag);
    }
  } catch (error) {
    console.warn("Failed to update news cache:", error);
  }
}

export async function fetchActivitiesSummary() {
  const response = await fetch("/api/activities");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
}

export async function fetchFeaturedSummary() {
  const response = await fetch("/api/featured");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
}
