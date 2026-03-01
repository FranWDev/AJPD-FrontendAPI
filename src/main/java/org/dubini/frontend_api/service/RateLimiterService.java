package org.dubini.frontend_api.service;

import java.time.Instant;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

@Service
public class RateLimiterService {

    private static final long RATE_LIMIT_HOURS = 24;
    private static final String RATE_LIMIT_MESSAGE = "Demasiadas solicitudes desde tu dirección IP. Por favor, intenta más tarde.";
    private static final boolean ENABLED = true;

    private final Cache<String, Instant> ipRequestCache;

    public RateLimiterService() {
        this.ipRequestCache = Caffeine.newBuilder()
                .expireAfterWrite(RATE_LIMIT_HOURS, TimeUnit.HOURS)
                .maximumSize(10000)
                .build();
    }

    public boolean canMakeRequest(String ip) {
        if (!ENABLED) {
            return true;
        }
        return ipRequestCache.getIfPresent(ip) == null;
    }

    public void recordRequest(String ip) {
        ipRequestCache.put(ip, Instant.now());
    }

    public String getRateLimitMessage() {
        return RATE_LIMIT_MESSAGE;
    }

    public Instant getLastRequestTime(String ip) {
        return ipRequestCache.getIfPresent(ip);
    }
}
