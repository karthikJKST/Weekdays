package com.weekdays.api.task;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        String title,
        String description,
        String projectId,
        String projectName,
        TaskStatus status,
        TaskPriority priority,
        LocalDate dueDate,
        TaskAssignee assignee,
        double estimatedHours,
        double spentHours,
        int position,
        List<TaskLabel> labels,
        List<TaskChecklistItem> checklist,
        List<TaskComment> comments,
        boolean archived,
        OffsetDateTime archivedAt,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public record TaskAssignee(String id, String name) {}
    public record TaskChecklistItem(String id, String text, boolean completed) {}
    public record TaskComment(String id, String author, String authorInitials, String text, String createdAt) {}
}
