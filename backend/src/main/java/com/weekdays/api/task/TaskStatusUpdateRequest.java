package com.weekdays.api.task;

import jakarta.validation.constraints.NotNull;

public record TaskStatusUpdateRequest(@NotNull TaskStatus status) {}
