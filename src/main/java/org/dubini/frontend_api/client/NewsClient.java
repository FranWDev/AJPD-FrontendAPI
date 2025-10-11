package org.dubini.frontend_api.client;
import org.dubini.frontend_api.dto.SummaryDTO;
import org.springframework.cloud.openfeign.FeignClient;

@FeignClient(name = "newsClient", url = "${backofficeAPI.url}")
public interface NewsClient {
    SummaryDTO[] getSummary();
    String getNewsPage(String newsIdentifier);
}