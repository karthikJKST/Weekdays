package com.weekdays.api.task;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record BulkStatusUpdateRequest(
        @NotEmpty List<String> ids,
        @NotNull TaskStatus status
) {}
