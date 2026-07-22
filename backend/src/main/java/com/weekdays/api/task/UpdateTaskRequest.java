package com.weekdays.api.task;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public record UpdateTaskRequest(
        @NotBlank @Size(min = 2, max = 200) String title,
        @Size(max = 2000) String description,
        @NotNull TaskStatus status,
        @NotNull TaskPriority priority,
        @NotBlank String projectId,
        LocalDate dueDate,
        String assigneeName,
        @Min(0) double estimatedHours,
        @Min(0) double spentHours,
        List<TaskLabel> labels
) {
    public UpdateTaskRequest {
        if (description == null) description = "";
        if (labels == null) labels = List.of();
    }
}
