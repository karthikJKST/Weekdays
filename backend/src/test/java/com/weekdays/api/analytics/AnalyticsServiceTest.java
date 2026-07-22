package com.weekdays.api.analytics;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

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
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TaskRepository taskRepository;

    private AnalyticsService service;
    private UUID ownerId;
    private User owner;
    private Project project;

    @BeforeEach
    void setUp() {
        service = new AnalyticsService(projectRepository, taskRepository);
        ownerId = UUID.randomUUID();
        owner = new User(ownerId, "Test", "test@test.com", "hash", UserRole.OWNER);
        project = new Project(UUID.randomUUID(), owner, "Test Project", "Desc",
                ProjectStatus.in_progress, ProjectPriority.high, "indigo",
                null, LocalDate.of(2026, 6, 1));
    }

    @Test
    void shouldReturnDashboardWithEmptyData() {
        when(projectRepository.findAllByOwnerIdAndArchivedFalseOrderByUpdatedAtDesc(ownerId))
                .thenReturn(List.of());
        when(taskRepository.findAllByOwnerIdAndArchivedFalseOrderByUpdatedAtDesc(ownerId))
                .thenReturn(List.of());
        when(taskRepository.countByStatusGrouped(ownerId)).thenReturn(List.of());
        when(taskRepository.countByPriorityGrouped(ownerId)).thenReturn(List.of());

        var result = service.getDashboard(ownerId);

        assertThat(result.summary().totalProjects()).isZero();
        assertThat(result.summary().totalTasks()).isZero();
        assertThat(result.summary().completionRate()).isZero();
        assertThat(result.projectHealth()).isEmpty();
        assertThat(result.teamWorkload()).isEmpty();
        assertThat(result.recentActivity()).isEmpty();
    }

    @Test
    void shouldReturnDashboardWithData() {
        when(projectRepository.countByOwnerIdAndArchivedFalse(ownerId)).thenReturn(1L);
        when(projectRepository.countActiveByOwnerId(ownerId)).thenReturn(1L);
        when(projectRepository.countCompletedByOwnerId(ownerId)).thenReturn(0L);
        when(projectRepository.findAllByOwnerIdAndArchivedFalseOrderByUpdatedAtDesc(ownerId))
                .thenReturn(List.of(project));
        var task1 = new Task(UUID.randomUUID(), owner, project, "Task 1", "",
                TaskStatus.done, TaskPriority.high, LocalDate.now(), null, "Alice", 8, "", "[]", "[]");
        var task2 = new Task(UUID.randomUUID(), owner, project, "Task 2", "",
                TaskStatus.todo, TaskPriority.low, LocalDate.now().minusDays(5), null, "Bob", 4, "", "[]", "[]");
        var task3 = new Task(UUID.randomUUID(), owner, project, "Task 3", "",
                TaskStatus.in_progress, TaskPriority.medium, null, null, "Alice", 6, "", "[]", "[]");
        when(taskRepository.findAllByOwnerIdAndArchivedFalseOrderByUpdatedAtDesc(ownerId))
                .thenReturn(List.of(task1, task2, task3));
        when(taskRepository.countCompletedByOwnerId(ownerId)).thenReturn(1L);
        when(taskRepository.sumEstimatedHoursByOwnerId(ownerId)).thenReturn(18.0);
        when(taskRepository.sumSpentHoursByOwnerId(ownerId)).thenReturn(0.0);

        when(taskRepository.countByStatusGrouped(ownerId))
                .thenReturn(List.of(
                        new Object[]{TaskStatus.done, 1L},
                        new Object[]{TaskStatus.todo, 1L},
                        new Object[]{TaskStatus.in_progress, 1L}
                ));
        when(taskRepository.countByPriorityGrouped(ownerId))
                .thenReturn(List.of(
                        new Object[]{TaskPriority.high, 1L},
                        new Object[]{TaskPriority.low, 1L},
                        new Object[]{TaskPriority.medium, 1L}
                ));

        var result = service.getDashboard(ownerId);

        assertThat(result.summary().totalProjects()).isEqualTo(1);
        assertThat(result.summary().activeProjects()).isEqualTo(1);
        assertThat(result.summary().totalTasks()).isEqualTo(3);
        assertThat(result.summary().completedTasks()).isEqualTo(1);
        assertThat(result.summary().overdueTasks()).isEqualTo(1);
        assertThat(result.summary().completionRate()).isEqualTo(33);
        assertThat(result.summary().productivityScore()).isGreaterThan(0);
        assertThat(result.summary().upcomingTasks()).isEqualTo(0);
        assertThat(result.summary().totalMembers()).isEqualTo(2);
        assertThat(result.projectHealth()).hasSize(1);
        assertThat(result.statusDistribution()).hasSize(4);
        assertThat(result.priorityDistribution()).hasSize(5);
        assertThat(result.teamWorkload()).hasSize(2);
    }

    @Test
    void shouldComputeProjectHealth() {
        when(projectRepository.findAllByOwnerIdAndArchivedFalseOrderByUpdatedAtDesc(ownerId))
                .thenReturn(List.of(project));
        when(taskRepository.findAllByOwnerIdAndArchivedFalseOrderByUpdatedAtDesc(ownerId))
                .thenReturn(List.of());
        when(taskRepository.countByStatusGrouped(ownerId)).thenReturn(List.of());
        when(taskRepository.countByPriorityGrouped(ownerId)).thenReturn(List.of());

        var result = service.getDashboard(ownerId);

        assertThat(result.projectHealth()).hasSize(1);
        assertThat(result.projectHealth().getFirst().name()).isEqualTo("Test Project");
        assertThat(result.projectHealth().getFirst().status()).isEqualTo("in_progress");
        assertThat(result.projectHealth().getFirst().completion()).isZero();
    }
}
