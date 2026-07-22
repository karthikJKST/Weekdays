package com.weekdays.api.task;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.weekdays.api.project.Project;
import com.weekdays.api.project.ProjectPriority;
import com.weekdays.api.project.ProjectRepository;
import com.weekdays.api.project.ProjectStatus;
import com.weekdays.api.user.User;
import com.weekdays.api.user.UserRole;
import java.time.LocalDate;
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
class TaskServiceTest {

    @Mock
    private TaskRepository repository;

    @Mock
    private ProjectRepository projectRepository;

    private TaskMapper mapper;
    private TaskService service;
    private User owner;
    private Project project;
    private Task task;

    @BeforeEach
    void setUp() {
        mapper = new TaskMapper();
        service = new TaskService(repository, projectRepository, mapper);
        owner = new User(UUID.randomUUID(), "Test Owner", "owner@test.com", "hash", UserRole.OWNER);
        project = new Project(UUID.randomUUID(), owner, "Test Project", "Desc",
                ProjectStatus.in_progress, ProjectPriority.high, "indigo",
                null, LocalDate.of(2026, 5, 1));
        task = new Task(UUID.randomUUID(), owner, project, "Test Task", "Description",
                TaskStatus.todo, TaskPriority.high, LocalDate.of(2026, 6, 1),
                null, "Alice", 8, mapper.toLabelsString(List.of(TaskLabel.feature, TaskLabel.bug)), "[]", "[]");
    }

    @Test
    void shouldGetAllTasks() {
        when(repository.findAllByOwnerIdAndArchivedFalseOrderByUpdatedAtDesc(owner.getId()))
                .thenReturn(List.of(task));

        var result = service.getAllTasks(owner.getId(), null, false);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().title()).isEqualTo("Test Task");
        assertThat(result.getFirst().status()).isEqualTo(TaskStatus.todo);
        assertThat(result.getFirst().priority()).isEqualTo(TaskPriority.high);
        assertThat(result.getFirst().labels()).containsExactly(TaskLabel.feature, TaskLabel.bug);
    }

    @Test
    void shouldGetTasksByProject() {
        when(repository.findAllByOwnerIdAndProjectIdAndArchivedFalseOrderByUpdatedAtDesc(owner.getId(), project.getId()))
                .thenReturn(List.of(task));

        var result = service.getAllTasks(owner.getId(), project.getId().toString(), false);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().title()).isEqualTo("Test Task");
    }

    @Test
    void shouldGetTaskById() {
        when(repository.findByIdAndOwnerId(task.getId(), owner.getId()))
                .thenReturn(Optional.of(task));

        var result = service.getTask(task.getId(), owner.getId());

        assertThat(result.id()).isEqualTo(task.getId());
        assertThat(result.title()).isEqualTo("Test Task");
    }

    @Test
    void shouldThrow404WhenTaskNotFound() {
        when(repository.findByIdAndOwnerId(any(), any()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getTask(UUID.randomUUID(), owner.getId()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404 NOT_FOUND");
    }

    @Test
    void shouldCreateTask() {
        var request = new CreateTaskRequest("New Task", "A new task", project.getId().toString(),
                TaskStatus.todo, TaskPriority.medium, LocalDate.of(2026, 7, 1),
                "Bob", 10, List.of(TaskLabel.feature));

        when(projectRepository.findByIdAndOwnerId(project.getId(), owner.getId()))
                .thenReturn(Optional.of(project));
        when(repository.findAllByOwnerIdAndProjectIdAndArchivedFalseOrderByUpdatedAtDesc(owner.getId(), project.getId()))
                .thenReturn(List.of());
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        var result = service.createTask(request, owner);

        assertThat(result.title()).isEqualTo("New Task");
        assertThat(result.status()).isEqualTo(TaskStatus.todo);
        assertThat(result.priority()).isEqualTo(TaskPriority.medium);
        assertThat(result.labels()).containsExactly(TaskLabel.feature);
        assertThat(result.projectName()).isEqualTo("Test Project");
        assertThat(result.position()).isEqualTo(0);
        verify(repository).save(any());
    }

    @Test
    void shouldUpdateTask() {
        when(repository.findByIdAndOwnerId(task.getId(), owner.getId()))
                .thenReturn(Optional.of(task));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        var request = new UpdateTaskRequest("Updated Task", "Updated desc",
                TaskStatus.in_progress, TaskPriority.urgent, project.getId().toString(),
                LocalDate.of(2026, 8, 1), "Charlie", 12, 5, List.of(TaskLabel.bug));

        var result = service.updateTask(task.getId(), request, owner.getId());

        assertThat(result.title()).isEqualTo("Updated Task");
        assertThat(result.status()).isEqualTo(TaskStatus.in_progress);
        assertThat(result.priority()).isEqualTo(TaskPriority.urgent);
        assertThat(result.estimatedHours()).isEqualTo(12);
        assertThat(result.spentHours()).isEqualTo(5);
        assertThat(result.assignee().name()).isEqualTo("Charlie");
    }

    @Test
    void shouldUpdateTaskStatus() {
        when(repository.findByIdAndOwnerId(task.getId(), owner.getId()))
                .thenReturn(Optional.of(task));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        var result = service.updateTaskStatus(task.getId(), TaskStatus.done, owner.getId());

        assertThat(result.status()).isEqualTo(TaskStatus.done);
    }

    @Test
    void shouldUpdateTaskPriority() {
        when(repository.findByIdAndOwnerId(task.getId(), owner.getId()))
                .thenReturn(Optional.of(task));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        var result = service.updateTaskPriority(task.getId(), TaskPriority.urgent, owner.getId());

        assertThat(result.priority()).isEqualTo(TaskPriority.urgent);
    }

    @Test
    void shouldArchiveAndRestoreTask() {
        when(repository.findByIdAndOwnerId(task.getId(), owner.getId()))
                .thenReturn(Optional.of(task));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        var archived = service.archiveTask(task.getId(), owner.getId());
        assertThat(archived.archived()).isTrue();

        when(repository.findByIdAndOwnerId(task.getId(), owner.getId()))
                .thenReturn(Optional.of(task));
        var restored = service.restoreTask(task.getId(), owner.getId());
        assertThat(restored.archived()).isFalse();
    }

    @Test
    void shouldAssignAndUnassignTask() {
        when(repository.findByIdAndOwnerId(task.getId(), owner.getId()))
                .thenReturn(Optional.of(task));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        var assignReq = new AssignTaskRequest("Bob", "");
        var assigned = service.assignTask(task.getId(), assignReq, owner.getId());
        assertThat(assigned.assignee().name()).isEqualTo("Bob");

        when(repository.findByIdAndOwnerId(task.getId(), owner.getId()))
                .thenReturn(Optional.of(task));
        var unassigned = service.unassignTask(task.getId(), owner.getId());
        assertThat(unassigned.assignee()).isNull();
    }

    @Test
    void shouldGetTodaysTasks() {
        when(repository.findAllByOwnerIdAndDueDateAndArchivedFalse(owner.getId(), LocalDate.now()))
                .thenReturn(List.of(task));

        var result = service.getTodaysTasks(owner.getId());
        assertThat(result).hasSize(1);
    }

    @Test
    void shouldGetOverdueTasks() {
        when(repository.findAllByOwnerIdAndDueDateBeforeAndArchivedFalse(owner.getId(), LocalDate.now()))
                .thenReturn(List.of(task));

        var result = service.getOverdueTasks(owner.getId());
        assertThat(result).hasSize(1);
    }

    @Test
    void shouldGetCompletedTasks() {
        when(repository.findAllByOwnerIdAndStatusAndArchivedFalseOrderByUpdatedAtDesc(owner.getId(), TaskStatus.done))
                .thenReturn(List.of(task));

        var result = service.getCompletedTasks(owner.getId());
        assertThat(result).hasSize(1);
    }

    @Test
    void shouldSearchTasks() {
        when(repository.searchByOwnerId(owner.getId(), "test"))
                .thenReturn(List.of(task));

        var result = service.searchTasks(owner.getId(), "test");
        assertThat(result).hasSize(1);
    }

    @Test
    void shouldDeleteTask() {
        when(repository.findByIdAndOwnerId(task.getId(), owner.getId()))
                .thenReturn(Optional.of(task));

        service.deleteTask(task.getId(), owner.getId());

        verify(repository).delete(task);
    }

    @Test
    void shouldBulkArchiveAndRestore() {
        var task2 = new Task(UUID.randomUUID(), owner, project, "Task 2", "",
                TaskStatus.todo, TaskPriority.low, null, null, null, 0, "", "[]", "[]");
        var ids = List.of(task.getId().toString(), task2.getId().toString());
        var uuids = List.of(task.getId(), task2.getId());

        when(repository.findAllByIdInAndOwnerId(uuids, owner.getId()))
                .thenReturn(List.of(task, task2));

        service.bulkArchive(ids, owner.getId());
        assertThat(task.isArchived()).isTrue();
        assertThat(task2.isArchived()).isTrue();

        when(repository.findAllByIdInAndOwnerId(uuids, owner.getId()))
                .thenReturn(List.of(task, task2));

        service.bulkRestore(ids, owner.getId());
        assertThat(task.isArchived()).isFalse();
        assertThat(task2.isArchived()).isFalse();
    }

    @Test
    void shouldBulkUpdateStatus() {
        var task2 = new Task(UUID.randomUUID(), owner, project, "Task 2", "",
                TaskStatus.todo, TaskPriority.low, null, null, null, 0, "", "[]", "[]");
        var ids = List.of(task.getId().toString(), task2.getId().toString());
        var uuids = List.of(task.getId(), task2.getId());

        when(repository.findAllByIdInAndOwnerId(uuids, owner.getId()))
                .thenReturn(List.of(task, task2));

        service.bulkUpdateStatus(ids, TaskStatus.done, owner.getId());

        assertThat(task.getStatus()).isEqualTo(TaskStatus.done);
        assertThat(task2.getStatus()).isEqualTo(TaskStatus.done);
        verify(repository).saveAll(List.of(task, task2));
    }

    @Test
    void shouldBulkUpdatePriority() {
        var task2 = new Task(UUID.randomUUID(), owner, project, "Task 2", "",
                TaskStatus.todo, TaskPriority.low, null, null, null, 0, "", "[]", "[]");
        var ids = List.of(task.getId().toString(), task2.getId().toString());
        var uuids = List.of(task.getId(), task2.getId());

        when(repository.findAllByIdInAndOwnerId(uuids, owner.getId()))
                .thenReturn(List.of(task, task2));

        service.bulkUpdatePriority(ids, TaskPriority.urgent, owner.getId());

        assertThat(task.getPriority()).isEqualTo(TaskPriority.urgent);
        assertThat(task2.getPriority()).isEqualTo(TaskPriority.urgent);
        verify(repository).saveAll(List.of(task, task2));
    }

    @Test
    void shouldBulkDelete() {
        var task2 = new Task(UUID.randomUUID(), owner, project, "Task 2", "",
                TaskStatus.todo, TaskPriority.low, null, null, null, 0, "", "[]", "[]");
        var ids = List.of(task.getId().toString(), task2.getId().toString());
        var uuids = List.of(task.getId(), task2.getId());

        when(repository.findAllByIdInAndOwnerId(uuids, owner.getId()))
                .thenReturn(List.of(task, task2));

        service.bulkDelete(ids, owner.getId());

        verify(repository).deleteAll(List.of(task, task2));
    }

    @Test
    void shouldThrow404ForOtherUsersTasks() {
        UUID otherUserId = UUID.randomUUID();
        when(repository.findByIdAndOwnerId(task.getId(), otherUserId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getTask(task.getId(), otherUserId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404 NOT_FOUND");
    }

    @Test
    void shouldUpdateTaskDueDate() {
        when(repository.findByIdAndOwnerId(task.getId(), owner.getId()))
                .thenReturn(Optional.of(task));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        var result = service.updateTaskDueDate(task.getId(), LocalDate.of(2026, 9, 1), owner.getId());

        assertThat(result.dueDate()).isEqualTo(LocalDate.of(2026, 9, 1));
    }

    @Test
    void shouldUpdateTaskPosition() {
        when(repository.findByIdAndOwnerId(task.getId(), owner.getId()))
                .thenReturn(Optional.of(task));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        var result = service.updateTaskPosition(task.getId(), 5, owner.getId());

        assertThat(result.position()).isEqualTo(5);
    }
}
