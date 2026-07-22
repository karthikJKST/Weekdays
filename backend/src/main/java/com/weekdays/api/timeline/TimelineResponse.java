package com.weekdays.api.timeline;

import java.util.List;

public record TimelineResponse(
        List<TimelineActivity> items,
        int page,
        int size,
        int totalPages,
        long totalItems
) {
    public record TimelineActivity(
            String id,
            String type,
            String title,
            String description,
            String projectId,
            String projectName,
            String taskId,
            String calendarEventId,
            String timestamp,
            String actor,
            String icon,
            String color
    ) {}
}
