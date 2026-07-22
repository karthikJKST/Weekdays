package com.weekdays.api.task;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public record CreateTaskRequest(
        @NotBlank @Size(min = 2, max = 200) String title,
        @Size(max = 2000) String description,
        @NotBlank String projectId,
        TaskStatus status,
        TaskPriority priority,
        LocalDate dueDate,
        String assigneeName,
        @Min(0) double estimatedHours,
        List<TaskLabel> labels
) {
    public CreateTaskRequest {
        if (description == null) description = "";
        if (status == null) status = TaskStatus.todo;
        if (priority == null) priority = TaskPriority.none;
        if (labels == null) labels = List.of();
    }
}
