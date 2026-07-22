package com.weekdays.api.project;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ProjectResponse(
        UUID id,
        String name,
        String description,
        ProjectStatus status,
        ProjectPriority priority,
        String color,
        LocalDate dueDate,
        int taskCount,
        int completedTaskCount,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public ProjectResponse(UUID id, String name, String description,
                           ProjectStatus status, ProjectPriority priority,
                           String color, LocalDate dueDate,
                           OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this(id, name, description, status, priority, color, dueDate, 0, 0, createdAt, updatedAt);
    }
}
