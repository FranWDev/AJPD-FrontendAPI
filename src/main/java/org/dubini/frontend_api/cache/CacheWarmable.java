package org.dubini.frontend_api.cache;

import reactor.core.publisher.Mono;

public interface CacheWarmable {

    String getCacheName();

    Mono<Void> warmUpCache();
}
