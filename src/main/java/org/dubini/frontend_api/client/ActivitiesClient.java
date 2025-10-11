package org.dubini.frontend_api.client;
import org.dubini.frontend_api.dto.SummaryDTO;
import org.springframework.cloud.openfeign.FeignClient;

@FeignClient(name = "activitiesClient", url = "${backofficeAPI.url}")
public interface ActivitiesClient {
    SummaryDTO[] getSummary();
    String getActivitiesPage(String activitiesIdentifier);
}