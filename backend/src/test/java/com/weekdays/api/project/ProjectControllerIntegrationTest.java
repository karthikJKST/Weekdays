package com.weekdays.api.project;

import static org.assertj.core.api.Assertions.assertThat;

import com.weekdays.api.auth.AuthResponse;
import com.weekdays.api.auth.RefreshTokenRepository;
import com.weekdays.api.auth.RegisterRequest;
import com.weekdays.api.calendar.CalendarRepository;
import com.weekdays.api.user.UserRepository;
import com.weekdays.api.project.ProjectRepository;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ProjectControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private CalendarRepository calendarRepository;

    private String token;
    private String otherToken;
    private AuthResponse.UserSummary userSummary;

    @BeforeEach
    void setUp() {
        // Clean in FK order: calendar_events -> tasks -> projects -> refresh_tokens -> users
        calendarRepository.deleteAll();
        projectRepository.deleteAll();
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();

        // Register the primary test user
        var registerResponse = restTemplate.postForEntity("/api/v1/auth/register",
                new RegisterRequest("Alice", "alice@example.com", "password123"),
                AuthResponse.class);
        token = registerResponse.getBody().accessToken();
        userSummary = registerResponse.getBody().user();

        // Register a second user for isolation tests
        var otherRegister = restTemplate.postForEntity("/api/v1/auth/register",
                new RegisterRequest("Bob", "bob@example.com", "password456"),
                AuthResponse.class);
        otherToken = otherRegister.getBody().accessToken();
    }

    private HttpHeaders authHeaders(String bearerToken) {
        var headers = new HttpHeaders();
        headers.setBearerAuth(bearerToken);
        return headers;
    }

    @Test
    void shouldCreateAndRetrieveProject() {
        // Create
        var createRequest = new CreateProjectRequest("My Project", "A test project",
                ProjectStatus.backlog, ProjectPriority.medium, "indigo", LocalDate.of(2026, 6, 15));

        var createResponse = restTemplate.exchange("/api/v1/projects",
                HttpMethod.POST, new HttpEntity<>(createRequest, authHeaders(token)),
                ProjectResponse.class);

        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        var created = createResponse.getBody();
        assertThat(created.name()).isEqualTo("My Project");
        assertThat(created.status()).isEqualTo(ProjectStatus.backlog);
        assertThat(created.dueDate()).isEqualTo(LocalDate.of(2026, 6, 15));

        // Get all
        var getAllResponse = restTemplate.exchange("/api/v1/projects",
                HttpMethod.GET, new HttpEntity<>(authHeaders(token)),
                new ParameterizedTypeReference<ProjectResponse[]>() {});

        assertThat(getAllResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getAllResponse.getBody()).hasSize(1);

        // Get by id
        var getResponse = restTemplate.exchange("/api/v1/projects/" + created.id(),
                HttpMethod.GET, new HttpEntity<>(authHeaders(token)),
                ProjectResponse.class);

        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody().name()).isEqualTo("My Project");
    }

    @Test
    void shouldEnforceUserIsolation() {
        // Alice creates a project
        var createAlice = new CreateProjectRequest("Alice's Project", "", ProjectStatus.backlog,
                ProjectPriority.low, "indigo", null);
        var aliceProject = restTemplate.exchange("/api/v1/projects",
                HttpMethod.POST, new HttpEntity<>(createAlice, authHeaders(token)),
                ProjectResponse.class).getBody();

        // Bob should not see it
        var bobGet = restTemplate.exchange("/api/v1/projects/" + aliceProject.id(),
                HttpMethod.GET, new HttpEntity<>(authHeaders(otherToken)),
                ProblemDetail.class);

        assertThat(bobGet.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void shouldUpdateProject() {
        // Create
        var create = new CreateProjectRequest("Original", "Original desc",
                ProjectStatus.backlog, ProjectPriority.medium, "indigo", null);
        var created = restTemplate.exchange("/api/v1/projects",
                HttpMethod.POST, new HttpEntity<>(create, authHeaders(token)),
                ProjectResponse.class).getBody();

        // Update
        var update = new UpdateProjectRequest("Updated", "Updated desc",
                ProjectStatus.in_progress, ProjectPriority.high, "emerald", LocalDate.of(2026, 7, 1));
        var updateResponse = restTemplate.exchange("/api/v1/projects/" + created.id(),
                HttpMethod.PUT, new HttpEntity<>(update, authHeaders(token)),
                ProjectResponse.class);

        assertThat(updateResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(updateResponse.getBody().name()).isEqualTo("Updated");
        assertThat(updateResponse.getBody().status()).isEqualTo(ProjectStatus.in_progress);
        assertThat(updateResponse.getBody().priority()).isEqualTo(ProjectPriority.high);
        assertThat(updateResponse.getBody().dueDate()).isEqualTo(LocalDate.of(2026, 7, 1));
    }

    @Test
    void shouldUpdateProjectStatus() {
        var create = new CreateProjectRequest("Status Test", "", ProjectStatus.backlog,
                ProjectPriority.medium, "indigo", null);
        var created = restTemplate.exchange("/api/v1/projects",
                HttpMethod.POST, new HttpEntity<>(create, authHeaders(token)),
                ProjectResponse.class).getBody();

        var statusResponse = restTemplate.exchange("/api/v1/projects/" + created.id() + "/status",
                HttpMethod.PATCH, new HttpEntity<>(new StatusUpdateRequest(ProjectStatus.done), authHeaders(token)),
                ProjectResponse.class);

        assertThat(statusResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(statusResponse.getBody().status()).isEqualTo(ProjectStatus.done);
    }

    @Test
    void shouldDeleteProject() {
        var create = new CreateProjectRequest("Delete Me", "", ProjectStatus.backlog,
                ProjectPriority.low, "indigo", null);
        var created = restTemplate.exchange("/api/v1/projects",
                HttpMethod.POST, new HttpEntity<>(create, authHeaders(token)),
                ProjectResponse.class).getBody();

        var deleteResponse = restTemplate.exchange("/api/v1/projects/" + created.id(),
                HttpMethod.DELETE, new HttpEntity<>(authHeaders(token)),
                Void.class);

        assertThat(deleteResponse.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        // Verify it's gone
        var getResponse = restTemplate.exchange("/api/v1/projects/" + created.id(),
                HttpMethod.GET, new HttpEntity<>(authHeaders(token)),
                ProblemDetail.class);
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void shouldArchiveProject() {
        var create = new CreateProjectRequest("Archive Me", "", ProjectStatus.in_progress,
                ProjectPriority.high, "rose", null);
        var created = restTemplate.exchange("/api/v1/projects",
                HttpMethod.POST, new HttpEntity<>(create, authHeaders(token)),
                ProjectResponse.class).getBody();

        var archiveResponse = restTemplate.exchange("/api/v1/projects/" + created.id() + "/archive",
                HttpMethod.PATCH, new HttpEntity<>(authHeaders(token)),
                ProjectResponse.class);

        assertThat(archiveResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Should not appear in default list (includeArchived=false)
        var getAll = restTemplate.exchange("/api/v1/projects",
                HttpMethod.GET, new HttpEntity<>(authHeaders(token)),
                new ParameterizedTypeReference<ProjectResponse[]>() {});
        assertThat(getAll.getBody()).isEmpty();

        // Should appear when includeArchived=true
        var getAllArchived = restTemplate.exchange("/api/v1/projects?includeArchived=true",
                HttpMethod.GET, new HttpEntity<>(authHeaders(token)),
                new ParameterizedTypeReference<ProjectResponse[]>() {});
        assertThat(getAllArchived.getBody()).hasSize(1);
    }

    @Test
    void shouldRejectUnauthenticatedAccess() {
        var response = restTemplate.exchange("/api/v1/projects",
                HttpMethod.GET, null, String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void shouldRejectCreateWithBlankName() {
        var request = new CreateProjectRequest("", "desc", ProjectStatus.backlog,
                ProjectPriority.low, "indigo", null);
        var response = restTemplate.exchange("/api/v1/projects",
                HttpMethod.POST, new HttpEntity<>(request, authHeaders(token)),
                ProblemDetail.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
}
