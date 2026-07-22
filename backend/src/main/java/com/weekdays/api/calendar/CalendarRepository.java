package com.weekdays.api.calendar;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CalendarRepository extends JpaRepository<CalendarEvent, UUID> {

    Optional<CalendarEvent> findByIdAndOwnerId(UUID id, UUID ownerId);

    List<CalendarEvent> findAllByOwnerIdOrderByStartTimeAsc(UUID ownerId);

    List<CalendarEvent> findAllByOwnerIdAndProjectIdOrderByStartTimeAsc(UUID ownerId, UUID projectId);

    List<CalendarEvent> findAllByOwnerIdAndStartTimeBetweenOrderByStartTimeAsc(
            UUID ownerId, LocalDateTime from, LocalDateTime to);
}
