package com.weekdays.api.task;

import static org.assertj.core.api.Assertions.assertThat;

import com.weekdays.api.auth.AuthResponse;
import com.weekdays.api.auth.RefreshTokenRepository;
import com.weekdays.api.auth.RegisterRequest;
import com.weekdays.api.calendar.CalendarRepository;
import com.weekdays.api.project.CreateProjectRequest;
import com.weekdays.api.project.ProjectPriority;
import com.weekdays.api.project.ProjectRepository;
import com.weekdays.api.project.ProjectResponse;
import com.weekdays.api.project.ProjectStatus;
import com.weekdays.api.user.UserRepository;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class TaskControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private CalendarRepository calendarRepository;

    private String token;
    private String otherToken;
    private ProjectResponse project;
    private HttpHeaders auth;

    private static class HttpHeaders extends org.springframework.http.HttpHeaders {
        HttpHeaders(String bearerToken) {
            setBearerAuth(bearerToken);
        }
    }

    @BeforeEach
    void setUp() {
        calendarRepository.deleteAll();
        taskRepository.deleteAll();
        projectRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();

        var registerResponse = restTemplate.postForEntity("/api/v1/auth/register",
                new RegisterRequest("Alice", "alice@example.com", "password123"),
                AuthResponse.class);
        token = registerResponse.getBody().accessToken();
        auth = new HttpHeaders(token);

        var otherRegister = restTemplate.postForEntity("/api/v1/auth/register",
                new RegisterRequest("Bob", "bob@example.com", "password456"),
                AuthResponse.class);
        otherToken = otherRegister.getBody().accessToken();

        var createProject = new CreateProjectRequest("Test Project", "A project for tasks",
                ProjectStatus.backlog, ProjectPriority.medium, "indigo", null);
        project = restTemplate.exchange("/api/v1/projects",
                HttpMethod.POST, new HttpEntity<>(createProject, auth),
                ProjectResponse.class).getBody();
    }

    @Test
    void shouldCreateAndRetrieveTask() {
        var createRequest = new CreateTaskRequest("My Task", "A test task", project.id().toString(),
                TaskStatus.todo, TaskPriority.high, LocalDate.of(2026, 6, 15),
                "Alice", 8, List.of(TaskLabel.feature));

        var createResponse = restTemplate.exchange("/api/v1/tasks",
                HttpMethod.POST, new HttpEntity<>(createRequest, auth),
                TaskResponse.class);

        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        var created = createResponse.getBody();
        assertThat(created.title()).isEqualTo("My Task");
        assertThat(created.status()).isEqualTo(TaskStatus.todo);
        assertThat(created.priority()).isEqualTo(TaskPriority.high);
        assertThat(created.projectName()).isEqualTo("Test Project");
        assertThat(created.labels()).containsExactly(TaskLabel.feature);
        assertThat(created.position()).isEqualTo(0);
        assertThat(created.archived()).isFalse();

        var getResponse = restTemplate.exchange("/api/v1/tasks/" + created.id(),
                HttpMethod.GET, new HttpEntity<>(auth),
                TaskResponse.class);
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody().title()).isEqualTo("My Task");
    }

    @Test
    void shouldEnforceUserIsolation() {
        var createRequest = new CreateTaskRequest("Alice's Task", "", project.id().toString(),
                TaskStatus.todo, TaskPriority.low, null, null, 0, List.of());
        var aliceTask = restTemplate.exchange("/api/v1/tasks",
                HttpMethod.POST, new HttpEntity<>(createRequest, auth),
                TaskResponse.class).getBody();

        var bobGet = restTemplate.exchange("/api/v1/tasks/" + aliceTask.id(),
                HttpMethod.GET, new HttpEntity<>(new HttpHeaders(otherToken)),
                ProblemDetail.class);
        assertThat(bobGet.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void shouldArchiveAndRestoreTask() {
        var create = new CreateTaskRequest("Archive Test", "", project.id().toString(),
                TaskStatus.todo, TaskPriority.medium, null, null, 0, List.of());
        var created = restTemplate.exchange("/api/v1/tasks",
                HttpMethod.POST, new HttpEntity<>(create, auth),
                TaskResponse.class).getBody();

        var archiveResponse = restTemplate.exchange("/api/v1/tasks/" + created.id() + "/archive",
                HttpMethod.PATCH, new HttpEntity<>(auth),
                TaskResponse.class);
        assertThat(archiveResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(archiveResponse.getBody().archived()).isTrue();

        var restoreResponse = restTemplate.exchange("/api/v1/tasks/" + created.id() + "/restore",
                HttpMethod.PATCH, new HttpEntity<>(auth),
                TaskResponse.class);
        assertThat(restoreResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(restoreResponse.getBody().archived()).isFalse();
    }

    @Test
    void shouldAssignToTask() {
        var create = new CreateTaskRequest("Assign Test", "", project.id().toString(),
                TaskStatus.todo, TaskPriority.low, null, null, 0, List.of());
        var created = restTemplate.exchange("/api/v1/tasks",
                HttpMethod.POST, new HttpEntity<>(create, auth),
                TaskResponse.class).getBody();

        var assignResponse = restTemplate.exchange("/api/v1/tasks/" + created.id() + "/assign",
                HttpMethod.PATCH, new HttpEntity<>(new AssignTaskRequest("Charlie", ""), auth),
                TaskResponse.class);
        assertThat(assignResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(assignResponse.getBody().assignee().name()).isEqualTo("Charlie");

        var unassignResponse = restTemplate.exchange("/api/v1/tasks/" + created.id() + "/unassign",
                HttpMethod.PATCH, new HttpEntity<>(auth),
                TaskResponse.class);
        assertThat(unassignResponse.getBody().assignee()).isNull();
    }

    @Test
    void shouldUpdateTaskPriority() {
        var create = new CreateTaskRequest("Priority Test", "", project.id().toString(),
                TaskStatus.todo, TaskPriority.low, null, null, 0, List.of());
        var created = restTemplate.exchange("/api/v1/tasks",
                HttpMethod.POST, new HttpEntity<>(create, auth),
                TaskResponse.class).getBody();

        var priorityResponse = restTemplate.exchange("/api/v1/tasks/" + created.id() + "/priority",
                HttpMethod.PATCH, new HttpEntity<>(new TaskPriorityUpdateRequest(TaskPriority.urgent), auth),
                TaskResponse.class);
        assertThat(priorityResponse.getBody().priority()).isEqualTo(TaskPriority.urgent);
    }

    @Test
    void shouldReturnSpecializedLists() {
        var create = new CreateTaskRequest("Today Task", "", project.id().toString(),
                TaskStatus.todo, TaskPriority.low, LocalDate.now(), null, 0, List.of());
        var created = restTemplate.exchange("/api/v1/tasks",
                HttpMethod.POST, new HttpEntity<>(create, auth),
                TaskResponse.class).getBody();

        var todayResponse = restTemplate.exchange("/api/v1/tasks/today",
                HttpMethod.GET, new HttpEntity<>(auth),
                new ParameterizedTypeReference<TaskResponse[]>() {});
        assertThat(todayResponse.getBody()).hasSize(1);
        assertThat(todayResponse.getBody()[0].id()).isEqualTo(created.id());
    }

    @Test
    void shouldSearchTasks() {
        var create = new CreateTaskRequest("Find this task", "searchable content", project.id().toString(),
                TaskStatus.todo, TaskPriority.low, null, null, 0, List.of());
        restTemplate.exchange("/api/v1/tasks",
                HttpMethod.POST, new HttpEntity<>(create, auth),
                TaskResponse.class).getBody();

        var searchResponse = restTemplate.exchange("/api/v1/tasks/search?q=searchable",
                HttpMethod.GET, new HttpEntity<>(auth),
                new ParameterizedTypeReference<TaskResponse[]>() {});
        assertThat(searchResponse.getBody()).hasSize(1);
        assertThat(searchResponse.getBody()[0].title()).isEqualTo("Find this task");
    }

    @Test
    void shouldUpdateTask() {
        var create = new CreateTaskRequest("Original", "Original desc", project.id().toString(),
                TaskStatus.todo, TaskPriority.medium, null, null, 0, List.of());
        var created = restTemplate.exchange("/api/v1/tasks",
                HttpMethod.POST, new HttpEntity<>(create, auth),
                TaskResponse.class).getBody();

        var update = new UpdateTaskRequest("Updated", "Updated desc",
                TaskStatus.in_progress, TaskPriority.urgent, project.id().toString(),
                LocalDate.of(2026, 7, 1), "Bob", 12, 5, List.of(TaskLabel.bug, TaskLabel.improvement));
        var updateResponse = restTemplate.exchange("/api/v1/tasks/" + created.id(),
                HttpMethod.PUT, new HttpEntity<>(update, auth),
                TaskResponse.class);

        assertThat(updateResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(updateResponse.getBody().title()).isEqualTo("Updated");
        assertThat(updateResponse.getBody().status()).isEqualTo(TaskStatus.in_progress);
        assertThat(updateResponse.getBody().priority()).isEqualTo(TaskPriority.urgent);
        assertThat(updateResponse.getBody().estimatedHours()).isEqualTo(12);
        assertThat(updateResponse.getBody().spentHours()).isEqualTo(5);
        assertThat(updateResponse.getBody().labels()).containsExactly(TaskLabel.bug, TaskLabel.improvement);
    }

    @Test
    void shouldUpdateTaskStatus() {
        var create = new CreateTaskRequest("Status Test", "", project.id().toString(),
                TaskStatus.todo, TaskPriority.medium, null, null, 0, List.of());
        var created = restTemplate.exchange("/api/v1/tasks",
                HttpMethod.POST, new HttpEntity<>(create, auth),
                TaskResponse.class).getBody();

        var statusResponse = restTemplate.exchange("/api/v1/tasks/" + created.id() + "/status",
                HttpMethod.PATCH, new HttpEntity<>(new TaskStatusUpdateRequest(TaskStatus.done), auth),
                TaskResponse.class);
        assertThat(statusResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(statusResponse.getBody().status()).isEqualTo(TaskStatus.done);
    }

    @Test
    void shouldDeleteTask() {
        var create = new CreateTaskRequest("Delete Me", "", project.id().toString(),
                TaskStatus.todo, TaskPriority.low, null, null, 0, List.of());
        var created = restTemplate.exchange("/api/v1/tasks",
                HttpMethod.POST, new HttpEntity<>(create, auth),
                TaskResponse.class).getBody();

        var deleteResponse = restTemplate.exchange("/api/v1/tasks/" + created.id(),
                HttpMethod.DELETE, new HttpEntity<>(auth), Void.class);
        assertThat(deleteResponse.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        var getResponse = restTemplate.exchange("/api/v1/tasks/" + created.id(),
                HttpMethod.GET, new HttpEntity<>(auth), ProblemDetail.class);
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void shouldFilterByProject() {
        var createProject2 = new CreateProjectRequest("Project 2", "", ProjectStatus.backlog,
                ProjectPriority.low, "emerald", null);
        var project2 = restTemplate.exchange("/api/v1/projects",
                HttpMethod.POST, new HttpEntity<>(createProject2, auth),
                ProjectResponse.class).getBody();

        restTemplate.exchange("/api/v1/tasks",
                HttpMethod.POST, new HttpEntity<>(
                        new CreateTaskRequest("Task in P1", "", project.id().toString(),
                                TaskStatus.todo, TaskPriority.medium, null, null, 0, List.of()), auth),
                TaskResponse.class);
        restTemplate.exchange("/api/v1/tasks",
                HttpMethod.POST, new HttpEntity<>(
                        new CreateTaskRequest("Task in P2", "", project2.id().toString(),
                                TaskStatus.todo, TaskPriority.medium, null, null, 0, List.of()), auth),
                TaskResponse.class);

        var filtered = restTemplate.exchange("/api/v1/tasks?projectId=" + project.id(),
                HttpMethod.GET, new HttpEntity<>(auth),
                new ParameterizedTypeReference<TaskResponse[]>() {});
        assertThat(filtered.getBody()).hasSize(1);
        assertThat(filtered.getBody()[0].projectId()).isEqualTo(project.id().toString());
    }

    @Test
    void shouldBulkUpdateStatus() {
        var t1 = restTemplate.exchange("/api/v1/tasks",
                HttpMethod.POST, new HttpEntity<>(
                        new CreateTaskRequest("Task 1", "", project.id().toString(),
                                TaskStatus.todo, TaskPriority.low, null, null, 0, List.of()), auth),
                TaskResponse.class).getBody();
        var t2 = restTemplate.exchange("/api/v1/tasks",
                HttpMethod.POST, new HttpEntity<>(
                        new CreateTaskRequest("Task 2", "", project.id().toString(),
                                TaskStatus.todo, TaskPriority.low, null, null, 0, List.of()), auth),
                TaskResponse.class).getBody();

        var bulkResponse = restTemplate.exchange("/api/v1/tasks/bulk/status",
                HttpMethod.PATCH, new HttpEntity<>(
                        new BulkStatusUpdateRequest(List.of(t1.id().toString(), t2.id().toString()), TaskStatus.in_progress), auth),
                Void.class);
        assertThat(bulkResponse.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        var getT1 = restTemplate.exchange("/api/v1/tasks/" + t1.id(),
                HttpMethod.GET, new HttpEntity<>(auth), TaskResponse.class).getBody();
        assertThat(getT1.status()).isEqualTo(TaskStatus.in_progress);
    }

    @Test
    void shouldBulkArchive() {
        var t1 = restTemplate.exchange("/api/v1/tasks",
                HttpMethod.POST, new HttpEntity<>(
                        new CreateTaskRequest("Task 1", "", project.id().toString(),
                                TaskStatus.todo, TaskPriority.low, null, null, 0, List.of()), auth),
                TaskResponse.class).getBody();
        var t2 = restTemplate.exchange("/api/v1/tasks",
                HttpMethod.POST, new HttpEntity<>(
                        new CreateTaskRequest("Task 2", "", project.id().toString(),
                                TaskStatus.todo, TaskPriority.low, null, null, 0, List.of()), auth),
                TaskResponse.class).getBody();

        var archiveResponse = restTemplate.exchange("/api/v1/tasks/bulk/archive",
                HttpMethod.PATCH, new HttpEntity<>(
                        new BulkDeleteRequest(List.of(t1.id().toString(), t2.id().toString())), auth),
                Void.class);
        assertThat(archiveResponse.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        var archivedList = restTemplate.exchange("/api/v1/tasks/archived",
                HttpMethod.GET, new HttpEntity<>(auth),
                new ParameterizedTypeReference<TaskResponse[]>() {});
        assertThat(archivedList.getBody()).hasSize(2);
    }

    @Test
    void shouldRejectUnauthenticatedAccess() {
        var response = restTemplate.exchange("/api/v1/tasks",
                HttpMethod.GET, null, String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void shouldRejectCreateWithBlankTitle() {
        var request = new CreateTaskRequest("", "desc", project.id().toString(),
                TaskStatus.todo, TaskPriority.low, null, null, 0, List.of());
        var response = restTemplate.exchange("/api/v1/tasks",
                HttpMethod.POST, new HttpEntity<>(request, auth),
                ProblemDetail.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void shouldReturnEmptyListWhenNoTasks() {
        var response = restTemplate.exchange("/api/v1/tasks",
                HttpMethod.GET, new HttpEntity<>(auth),
                new ParameterizedTypeReference<TaskResponse[]>() {});
        assertThat(response.getBody()).isEmpty();
    }
}
