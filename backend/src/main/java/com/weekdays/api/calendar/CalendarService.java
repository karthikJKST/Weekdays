package com.weekdays.api.calendar;

import com.weekdays.api.project.Project;
import com.weekdays.api.project.ProjectRepository;
import com.weekdays.api.task.Task;
import com.weekdays.api.task.TaskRepository;
import com.weekdays.api.user.User;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CalendarService {

    private final CalendarRepository repository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final CalendarMapper mapper;

    public CalendarService(CalendarRepository repository, ProjectRepository projectRepository,
                           TaskRepository taskRepository, CalendarMapper mapper) {
        this.repository = repository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents(UUID ownerId) {
        return repository.findAllByOwnerIdOrderByStartTimeAsc(ownerId)
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public EventResponse getEvent(UUID id, UUID ownerId) {
        return mapper.toResponse(findEvent(id, ownerId));
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getMonthEvents(UUID ownerId, int year, int month) {
        LocalDateTime from = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime to = from.plusMonths(1).minusSeconds(1);
        return repository.findAllByOwnerIdAndStartTimeBetweenOrderByStartTimeAsc(ownerId, from, to)
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getWeekEvents(UUID ownerId, LocalDate date) {
        LocalDateTime weekStart = date.atStartOfDay();
        LocalDateTime weekEnd = date.plusDays(7).atStartOfDay().minusSeconds(1);
        return repository.findAllByOwnerIdAndStartTimeBetweenOrderByStartTimeAsc(ownerId, weekStart, weekEnd)
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getDayEvents(UUID ownerId, LocalDate date) {
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.atTime(LocalTime.MAX);
        return repository.findAllByOwnerIdAndStartTimeBetweenOrderByStartTimeAsc(ownerId, dayStart, dayEnd)
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<EventResponse> getRangeEvents(UUID ownerId, LocalDateTime from, LocalDateTime to) {
        return repository.findAllByOwnerIdAndStartTimeBetweenOrderByStartTimeAsc(ownerId, from, to)
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional
    public EventResponse createEvent(CreateEventRequest request, User owner) {
        Project project = null;
        Task task = null;

        if (request.projectId() != null && !request.projectId().isBlank()) {
            project = projectRepository.findByIdAndOwnerId(UUID.fromString(request.projectId()), owner.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found."));
        }

        CalendarEvent event = new CalendarEvent(
                UUID.randomUUID(),
                owner,
                project,
                task,
                request.title().trim(),
                request.description(),
                request.eventType(),
                request.startTime(),
                request.endTime(),
                request.allDay(),
                request.color(),
                request.location()
        );
        event = repository.save(event);
        return mapper.toResponse(event);
    }

    @Transactional
    public EventResponse updateEvent(UUID id, UpdateEventRequest request, UUID ownerId) {
        CalendarEvent event = findEvent(id, ownerId);
        event.setTitle(request.title().trim());
        event.setDescription(request.description());
        event.setEventType(request.eventType());
        event.setStartTime(request.startTime());
        event.setEndTime(request.endTime());
        event.setAllDay(request.allDay());
        event.setColor(request.color());
        event.setLocation(request.location());
        event.preUpdate();
        event = repository.save(event);
        return mapper.toResponse(event);
    }

    @Transactional
    public void deleteEvent(UUID id, UUID ownerId) {
        CalendarEvent event = findEvent(id, ownerId);
        repository.delete(event);
    }

    private CalendarEvent findEvent(UUID id, UUID ownerId) {
        return repository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));
    }
}
