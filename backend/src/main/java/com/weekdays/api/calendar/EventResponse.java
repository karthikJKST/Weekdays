package com.weekdays.api.calendar;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.UUID;

public record EventResponse(
        UUID id,
        String title,
        String description,
        CalendarEventType eventType,
        LocalDateTime startTime,
        LocalDateTime endTime,
        boolean allDay,
        String color,
        String location,
        String projectId,
        String projectName,
        String taskId,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
