package com.weekdays.api.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateProjectRequest(
        @NotBlank @Size(min = 2, max = 200) String name,
        @Size(max = 2000) String description,
        ProjectStatus status,
        ProjectPriority priority,
        @NotBlank String color,
        LocalDate dueDate
) {
    public CreateProjectRequest {
        if (description == null) description = "";
        if (status == null) status = ProjectStatus.backlog;
        if (priority == null) priority = ProjectPriority.medium;
    }
}
