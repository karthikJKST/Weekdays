package com.weekdays.api.project;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

    public ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getStatus(),
                project.getPriority(),
                project.getColor(),
                project.getDueDate(),
                0,
                0,
                toOffsetDateTime(project.getCreatedAt()),
                toOffsetDateTime(project.getUpdatedAt())
        );
    }

    private static OffsetDateTime toOffsetDateTime(java.time.Instant instant) {
        return instant != null ? OffsetDateTime.ofInstant(instant, ZoneOffset.UTC) : null;
    }
}
