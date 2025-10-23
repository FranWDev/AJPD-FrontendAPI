package org.dubini.frontend_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableFeignClients
@EnableCaching
public class FrontendApiApplication {
	public static void main(String[] args) {
		SpringApplication.run(FrontendApiApplication.class, args);
	}

}
