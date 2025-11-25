package org.dubini.frontend_api.cache;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CacheInitializer {

    private final java.util.List<CacheWarmable> warmables;

    @PostConstruct
    public void init() {
        for (CacheWarmable w : warmables) {
            w.warmUpCache()
                    .doOnSubscribe(sub -> System.out.println("Regenerando cache: " + w.getCacheName()))
                    .doOnError(err -> System.err
                            .println("Error regenerando cache '" + w.getCacheName() + "': " + err.getMessage()))
                    .subscribe();
        }
    }
}
