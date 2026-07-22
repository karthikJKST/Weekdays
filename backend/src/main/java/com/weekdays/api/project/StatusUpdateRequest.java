package com.weekdays.api.project;

import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(
        @NotNull ProjectStatus status
) {}
