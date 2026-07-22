package com.weekdays.api.calendar;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.weekdays.api.project.Project;
import com.weekdays.api.project.ProjectPriority;
import com.weekdays.api.project.ProjectRepository;
import com.weekdays.api.project.ProjectStatus;
import com.weekdays.api.task.TaskRepository;
import com.weekdays.api.user.User;
import com.weekdays.api.user.UserRole;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class CalendarServiceTest {

    @Mock
    private CalendarRepository repository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TaskRepository taskRepository;

    private CalendarMapper mapper;
    private CalendarService service;
    private User owner;
    private Project project;
    private CalendarEvent event;

    @BeforeEach
    void setUp() {
        mapper = new CalendarMapper();
        service = new CalendarService(repository, projectRepository, taskRepository, mapper);
        owner = new User(UUID.randomUUID(), "Test Owner", "owner@test.com", "hash", UserRole.OWNER);
        project = new Project(UUID.randomUUID(), owner, "Test Project", "Desc",
                ProjectStatus.in_progress, ProjectPriority.high, "indigo",
                null, LocalDate.of(2026, 5, 1));
        event = new CalendarEvent(UUID.randomUUID(), owner, project, null,
                "Test Event", "Description", CalendarEventType.meeting,
                LocalDateTime.of(2026, 4, 15, 10, 0),
                LocalDateTime.of(2026, 4, 15, 11, 0),
                false, "indigo", "Room 1");
    }

    @Test
    void shouldGetAllEvents() {
        when(repository.findAllByOwnerIdOrderByStartTimeAsc(owner.getId()))
                .thenReturn(List.of(event));

        var result = service.getAllEvents(owner.getId());

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().title()).isEqualTo("Test Event");
        assertThat(result.getFirst().eventType()).isEqualTo(CalendarEventType.meeting);
    }

    @Test
    void shouldGetEventById() {
        when(repository.findByIdAndOwnerId(event.getId(), owner.getId()))
                .thenReturn(Optional.of(event));

        var result = service.getEvent(event.getId(), owner.getId());

        assertThat(result.id()).isEqualTo(event.getId());
        assertThat(result.title()).isEqualTo("Test Event");
    }

    @Test
    void shouldThrow404WhenEventNotFound() {
        when(repository.findByIdAndOwnerId(any(), any()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getEvent(UUID.randomUUID(), owner.getId()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404 NOT_FOUND");
    }

    @Test
    void shouldCreateEvent() {
        var request = new CreateEventRequest("New Event", "A new event",
                CalendarEventType.meeting,
                LocalDateTime.of(2026, 5, 1, 9, 0),
                LocalDateTime.of(2026, 5, 1, 10, 0),
                false, "emerald", "Room 2", null, null);

        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        var result = service.createEvent(request, owner);

        assertThat(result.title()).isEqualTo("New Event");
        assertThat(result.eventType()).isEqualTo(CalendarEventType.meeting);
        assertThat(result.color()).isEqualTo("emerald");
        assertThat(result.location()).isEqualTo("Room 2");
        verify(repository).save(any());
    }

    @Test
    void shouldUpdateEvent() {
        when(repository.findByIdAndOwnerId(event.getId(), owner.getId()))
                .thenReturn(Optional.of(event));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        var request = new UpdateEventRequest("Updated Event", "Updated desc",
                CalendarEventType.milestone,
                LocalDateTime.of(2026, 6, 1, 14, 0), null, true, "amber", "", null, null);

        var result = service.updateEvent(event.getId(), request, owner.getId());

        assertThat(result.title()).isEqualTo("Updated Event");
        assertThat(result.eventType()).isEqualTo(CalendarEventType.milestone);
        assertThat(result.allDay()).isTrue();
    }

    @Test
    void shouldDeleteEvent() {
        when(repository.findByIdAndOwnerId(event.getId(), owner.getId()))
                .thenReturn(Optional.of(event));

        service.deleteEvent(event.getId(), owner.getId());

        verify(repository).delete(event);
    }

    @Test
    void shouldGetMonthEvents() {
        when(repository.findAllByOwnerIdAndStartTimeBetweenOrderByStartTimeAsc(
                any(), any(), any())).thenReturn(List.of(event));

        var result = service.getMonthEvents(owner.getId(), 2026, 4);

        assertThat(result).hasSize(1);
    }

    @Test
    void shouldGetWeekEvents() {
        when(repository.findAllByOwnerIdAndStartTimeBetweenOrderByStartTimeAsc(
                any(), any(), any())).thenReturn(List.of(event));

        var result = service.getWeekEvents(owner.getId(), LocalDate.of(2026, 4, 13));

        assertThat(result).hasSize(1);
    }

    @Test
    void shouldGetDayEvents() {
        when(repository.findAllByOwnerIdAndStartTimeBetweenOrderByStartTimeAsc(
                any(), any(), any())).thenReturn(List.of(event));

        var result = service.getDayEvents(owner.getId(), LocalDate.of(2026, 4, 15));

        assertThat(result).hasSize(1);
    }

    @Test
    void shouldGetRangeEvents() {
        when(repository.findAllByOwnerIdAndStartTimeBetweenOrderByStartTimeAsc(
                any(), any(), any())).thenReturn(List.of(event));

        var result = service.getRangeEvents(owner.getId(),
                LocalDateTime.of(2026, 4, 1, 0, 0),
                LocalDateTime.of(2026, 4, 30, 23, 59));

        assertThat(result).hasSize(1);
    }

    @Test
    void shouldThrow404ForOtherUsersEvents() {
        UUID otherUserId = UUID.randomUUID();
        when(repository.findByIdAndOwnerId(event.getId(), otherUserId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getEvent(event.getId(), otherUserId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404 NOT_FOUND");
    }
}
