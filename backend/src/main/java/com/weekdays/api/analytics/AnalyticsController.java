package com.weekdays.api.analytics;

import com.weekdays.api.auth.UserDetailsImpl;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public AnalyticsResponse getDashboard(
            @AuthenticationPrincipal UserDetailsImpl principal) {
        return analyticsService.getDashboard(principal.getUser().getId());
    }
}
