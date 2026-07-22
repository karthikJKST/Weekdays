package com.weekdays.api.timeline;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.weekdays.api.calendar.CalendarEvent;
import com.weekdays.api.calendar.CalendarEventType;
import com.weekdays.api.calendar.CalendarRepository;
import com.weekdays.api.project.Project;
import com.weekdays.api.project.ProjectPriority;
import com.weekdays.api.project.ProjectRepository;
import com.weekdays.api.project.ProjectStatus;
import com.weekdays.api.task.Task;
import com.weekdays.api.task.TaskPriority;
import com.weekdays.api.task.TaskRepository;
import com.weekdays.api.task.TaskStatus;
import com.weekdays.api.user.User;
import com.weekdays.api.user.UserRole;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TimelineServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private CalendarRepository calendarRepository;

    private TimelineService service;
    private UUID ownerId;
    private User owner;
    private Project project;
    private Task task;

    @BeforeEach
    void setUp() {
        service = new TimelineService(projectRepository, taskRepository, calendarRepository);
        ownerId = UUID.randomUUID();
        owner = new User(ownerId, "Test", "test@test.com", "hash", UserRole.OWNER);
        project = new Project(UUID.randomUUID(), owner, "Test Project", "Desc",
                ProjectStatus.in_progress, ProjectPriority.high, "indigo",
                null, LocalDate.of(2026, 6, 1));
        task = new Task(UUID.randomUUID(), owner, project, "Test Task", "Desc",
                TaskStatus.todo, TaskPriority.high, LocalDate.now().plusDays(5),
                null, "Alice", 8, "", "[]", "[]");
    }

    @Test
    void shouldReturnEmptyTimeline() {
        when(projectRepository.findAllByOwnerIdOrderByUpdatedAtDesc(ownerId)).thenReturn(List.of());
        when(taskRepository.findAllByOwnerIdOrderByUpdatedAtDesc(ownerId)).thenReturn(List.of());
        when(calendarRepository.findAllByOwnerIdOrderByStartTimeAsc(ownerId)).thenReturn(List.of());

        var result = service.getTimeline(ownerId, 0, 20);

        assertThat(result.items()).isEmpty();
        assertThat(result.totalItems()).isZero();
        assertThat(result.totalPages()).isZero();
        assertThat(result.page()).isZero();
    }

    @Test
    void shouldGenerateActivitiesFromProjectAndTask() {
        when(projectRepository.findAllByOwnerIdOrderByUpdatedAtDesc(ownerId)).thenReturn(List.of(project));
        when(taskRepository.findAllByOwnerIdOrderByUpdatedAtDesc(ownerId)).thenReturn(List.of(task));
        when(calendarRepository.findAllByOwnerIdOrderByStartTimeAsc(ownerId)).thenReturn(List.of());

        var result = service.getTimeline(ownerId, 0, 20);

        assertThat(result.items()).isNotEmpty();
        assertThat(result.totalItems()).isGreaterThan(0);

        // Should have project created, project updated, task created activities
        // (task_updated not generated because createdAt == updatedAt in test data)
        var types = result.items().stream().map(TimelineResponse.TimelineActivity::type).distinct().toList();
        assertThat(types).contains("project_created", "project_updated", "task_created");
    }

    @Test
    void shouldIncludeTaskCompletedActivity() {
        Task doneTask = new Task(UUID.randomUUID(), owner, project, "Done Task", "",
                TaskStatus.done, TaskPriority.low, LocalDate.now(), null, "Bob", 4, "", "[]", "[]");

        when(projectRepository.findAllByOwnerIdOrderByUpdatedAtDesc(ownerId)).thenReturn(List.of(project));
        when(taskRepository.findAllByOwnerIdOrderByUpdatedAtDesc(ownerId)).thenReturn(List.of(doneTask));
        when(calendarRepository.findAllByOwnerIdOrderByStartTimeAsc(ownerId)).thenReturn(List.of());

        var result = service.getTimeline(ownerId, 0, 20);

        var completedActivities = result.items().stream()
                .filter(a -> a.type().equals("task_completed"))
                .toList();
        assertThat(completedActivities).isNotEmpty();
        assertThat(completedActivities.getFirst().title()).isEqualTo("Done Task");
    }

    @Test
    void shouldIncludeCalendarEventActivities() {
        var calEvent = new CalendarEvent(UUID.randomUUID(), owner, project, null,
                "Meeting", "Desc", CalendarEventType.meeting,
                LocalDateTime.of(2026, 4, 15, 10, 0), null, false, "indigo", "");

        when(projectRepository.findAllByOwnerIdOrderByUpdatedAtDesc(ownerId)).thenReturn(List.of(project));
        when(taskRepository.findAllByOwnerIdOrderByUpdatedAtDesc(ownerId)).thenReturn(List.of(task));
        when(calendarRepository.findAllByOwnerIdOrderByStartTimeAsc(ownerId)).thenReturn(List.of(calEvent));

        var result = service.getTimeline(ownerId, 0, 20);

        var calActivities = result.items().stream()
                .filter(a -> a.type().startsWith("calendar_event"))
                .toList();
        assertThat(calActivities).isNotEmpty();
        assertThat(calActivities.getFirst().title()).isEqualTo("Meeting");
    }

    @Test
    void shouldPaginateResults() {
        when(projectRepository.findAllByOwnerIdOrderByUpdatedAtDesc(ownerId)).thenReturn(List.of(project));
        when(taskRepository.findAllByOwnerIdOrderByUpdatedAtDesc(ownerId)).thenReturn(List.of(task));
        when(calendarRepository.findAllByOwnerIdOrderByStartTimeAsc(ownerId)).thenReturn(List.of());

        // Page 0, size 2
        var page0 = service.getTimeline(ownerId, 0, 2);
        assertThat(page0.items()).hasSize(2);
        assertThat(page0.page()).isZero();
        assertThat(page0.totalItems()).isGreaterThan(2);
        assertThat(page0.totalPages()).isGreaterThanOrEqualTo(2);

        // Page 1, size 2 should have remaining item (3 total - 2 on page 0 = 1 left)
        var page1 = service.getTimeline(ownerId, 1, 2);
        assertThat(page1.items()).hasSize(1);
        assertThat(page1.page()).isEqualTo(1);
    }

    @Test
    void shouldSortNewestFirst() {
        when(projectRepository.findAllByOwnerIdOrderByUpdatedAtDesc(ownerId)).thenReturn(List.of(project));
        when(taskRepository.findAllByOwnerIdOrderByUpdatedAtDesc(ownerId)).thenReturn(List.of(task));
        when(calendarRepository.findAllByOwnerIdOrderByStartTimeAsc(ownerId)).thenReturn(List.of());

        var result = service.getTimeline(ownerId, 0, 20);

        // Verify timestamps are descending
        var timestamps = result.items().stream().map(TimelineResponse.TimelineActivity::timestamp).toList();
        for (int i = 0; i < timestamps.size() - 1; i++) {
            assertThat(timestamps.get(i)).isGreaterThanOrEqualTo(timestamps.get(i + 1));
        }
    }
}
