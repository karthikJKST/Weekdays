package com.weekdays.api.calendar;

import org.springframework.stereotype.Component;

@Component
public class CalendarMapper {

    public EventResponse toResponse(CalendarEvent event) {
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getEventType(),
                event.getStartTime(),
                event.getEndTime(),
                event.isAllDay(),
                event.getColor(),
                event.getLocation(),
                event.getProject() != null ? event.getProject().getId().toString() : null,
                event.getProject() != null ? event.getProject().getName() : null,
                event.getTask() != null ? event.getTask().getId().toString() : null,
                event.getCreatedAt().atOffset(java.time.ZoneOffset.UTC),
                event.getUpdatedAt().atOffset(java.time.ZoneOffset.UTC)
        );
    }
}
