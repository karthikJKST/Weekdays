package com.weekdays.api.calendar;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record UpdateEventRequest(
        @NotBlank @Size(min = 2, max = 300) String title,
        @Size(max = 2000) String description,
        @NotNull CalendarEventType eventType,
        @NotNull LocalDateTime startTime,
        LocalDateTime endTime,
        boolean allDay,
        String color,
        String location,
        String projectId,
        String taskId
) {
    public UpdateEventRequest {
        if (description == null) description = "";
        if (color == null) color = "indigo";
        if (location == null) location = "";
    }
}
