package com.weekdays.api.task;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record BulkPriorityUpdateRequest(
        @NotEmpty List<String> ids,
        @NotNull TaskPriority priority
) {}
