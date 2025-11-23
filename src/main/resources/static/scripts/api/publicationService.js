import { CacheService } from "./cacheService.js";

export async function fetchNewsSummary() {
  const cachedNews = CacheService.getNewsFromCache();
  const cacheEtag = CacheService.getNewsEtag();

  try {
    // Si no hay caché, hacer fetch completo
    if (!cachedNews || !cacheEtag) {
      const response = await fetch("/api/news");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const news = await response.json();
      const etag = response.headers.get("ETag");
      CacheService.saveNewsToCache(news, etag);
      return news;
    }

    // Verificar si hay cambios usando ETag
    const lastModifiedResponse = await fetch("/api/news/last", {
      method: "HEAD",
      headers: {
        "If-None-Match": cacheEtag,
      },
      cache: "no-store",
    });

    // 304 = No hay cambios, usar caché
    if (lastModifiedResponse.status === 304) {
      return cachedNews;
    }

    // 200 = Hay cambios, hacer fetch completo
    if (lastModifiedResponse.ok) {
      const response = await fetch("/api/news");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const news = await response.json();
      const etag = response.headers.get("ETag");
      CacheService.saveNewsToCache(news, etag);
      return news;
    }

    // Si hay error en la verificación, usar caché como fallback
    console.warn("Error checking cache status, using cached data");
    return cachedNews;
  } catch (error) {
    console.error("Error fetching news:", error);
    // Fallback a caché si hay error
    if (cachedNews) {
      return cachedNews;
    }
    throw error;
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