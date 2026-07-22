package com.weekdays.api.task;

import static org.assertj.core.api.Assertions.assertThat;

import com.weekdays.api.project.Project;
import com.weekdays.api.project.ProjectPriority;
import com.weekdays.api.project.ProjectRepository;
import com.weekdays.api.project.ProjectStatus;
import com.weekdays.api.user.User;
import com.weekdays.api.user.UserRepository;
import com.weekdays.api.user.UserRole;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
class TaskRepositoryTest {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    private User owner;
    private Project project;
    private Task task;

    @BeforeEach
    void setUp() {
        owner = userRepository.save(new User(UUID.randomUUID(), "Test", "test@test.com", "hash", UserRole.OWNER));
        project = projectRepository.save(new Project(UUID.randomUUID(), owner, "P1", "Desc",
                ProjectStatus.backlog, ProjectPriority.medium, "indigo", null, null));

        task = new Task(UUID.randomUUID(), owner, project, "Test Task", "Desc",
                TaskStatus.todo, TaskPriority.high, LocalDate.now(), null, "Alice", 8,
                "", "[]", "[]");
        task = taskRepository.save(task);
    }

    @Test
    void shouldFindByIdAndOwnerId() {
        var found = taskRepository.findByIdAndOwnerId(task.getId(), owner.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("Test Task");
    }

    @Test
    void shouldNotFindByWrongOwner() {
        var found = taskRepository.findByIdAndOwnerId(task.getId(), UUID.randomUUID());
        assertThat(found).isEmpty();
    }

    @Test
    void shouldFindAllByOwnerId() {
        var results = taskRepository.findAllByOwnerIdAndArchivedFalseOrderByUpdatedAtDesc(owner.getId());
        assertThat(results).hasSize(1);
    }

    @Test
    void shouldFindByProjectId() {
        var results = taskRepository.findAllByOwnerIdAndProjectIdAndArchivedFalseOrderByUpdatedAtDesc(
                owner.getId(), project.getId());
        assertThat(results).hasSize(1);
    }

    @Test
    void shouldFindTodaysTasks() {
        var results = taskRepository.findAllByOwnerIdAndDueDateAndArchivedFalse(owner.getId(), LocalDate.now());
        assertThat(results).hasSize(1);
    }

    @Test
    void shouldFindUpcomingTasks() {
        var results = taskRepository.findUpcomingByOwnerId(owner.getId(), LocalDate.now().minusDays(1));
        assertThat(results).hasSize(1);
    }

    @Test
    void shouldFindOverdueTasks() {
        task.setDueDate(LocalDate.now().minusDays(1));
        taskRepository.save(task);

        var results = taskRepository.findAllByOwnerIdAndDueDateBeforeAndArchivedFalse(owner.getId(), LocalDate.now());
        assertThat(results).hasSize(1);
    }

    @Test
    void shouldSearchTasks() {
        var results = taskRepository.searchByOwnerId(owner.getId(), "test");
        assertThat(results).hasSize(1);
    }

    @Test
    void shouldFilterArchived() {
        var results = taskRepository.findAllByOwnerIdAndArchivedFalseOrderByUpdatedAtDesc(owner.getId());
        assertThat(results).hasSize(1);

        task.setArchived(true);
        taskRepository.save(task);

        var archived = taskRepository.findAllByOwnerIdAndArchivedTrueOrderByUpdatedAtDesc(owner.getId());
        assertThat(archived).hasSize(1);

        var nonArchived = taskRepository.findAllByOwnerIdAndArchivedFalseOrderByUpdatedAtDesc(owner.getId());
        assertThat(nonArchived).isEmpty();
    }

    @Test
    void shouldFindCompletedTasks() {
        task.setStatus(TaskStatus.done);
        taskRepository.save(task);

        var results = taskRepository.findAllByOwnerIdAndStatusAndArchivedFalseOrderByUpdatedAtDesc(
                owner.getId(), TaskStatus.done);
        assertThat(results).hasSize(1);
    }

    @Test
    void shouldFindByIdInAndOwnerId() {
        var results = taskRepository.findAllByIdInAndOwnerId(List.of(task.getId()), owner.getId());
        assertThat(results).hasSize(1);
    }
}
