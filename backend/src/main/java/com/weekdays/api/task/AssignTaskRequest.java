package com.weekdays.api.task;

import jakarta.validation.constraints.NotBlank;

public record AssignTaskRequest(
        @NotBlank String assigneeName,
        String assigneeId
) {}
