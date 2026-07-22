package com.weekdays.api.task;

import jakarta.validation.constraints.NotNull;

public record TaskPriorityUpdateRequest(@NotNull TaskPriority priority) {}
