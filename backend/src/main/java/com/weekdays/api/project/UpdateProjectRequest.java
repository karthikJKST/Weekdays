package com.weekdays.api.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record UpdateProjectRequest(
        @NotBlank @Size(min = 2, max = 200) String name,
        @Size(max = 2000) String description,
        @NotNull ProjectStatus status,
        @NotNull ProjectPriority priority,
        @NotBlank String color,
        LocalDate dueDate
) {
    public UpdateProjectRequest {
        if (description == null) description = "";
    }
}
