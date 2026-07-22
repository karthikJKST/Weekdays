package com.weekdays.api.timeline;

import static org.assertj.core.api.Assertions.assertThat;

import com.weekdays.api.auth.AuthResponse;
import com.weekdays.api.auth.RefreshTokenRepository;
import com.weekdays.api.auth.RegisterRequest;
import com.weekdays.api.calendar.CalendarRepository;
import com.weekdays.api.project.ProjectRepository;
import com.weekdays.api.task.TaskRepository;
import com.weekdays.api.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class TimelineControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private CalendarRepository calendarRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    private String token;

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
    }

    private org.springframework.http.HttpHeaders authHeaders() {
        var headers = new org.springframework.http.HttpHeaders();
        headers.setBearerAuth(token);
        return headers;
    }

    @Test
    void shouldReturnEmptyTimeline() {
        var response = restTemplate.exchange("/api/v1/timeline?page=0&size=20",
                HttpMethod.GET, new HttpEntity<>(authHeaders()),
                TimelineResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().items()).isEmpty();
        assertThat(response.getBody().totalItems()).isZero();
        assertThat(response.getBody().page()).isZero();
    }

    @Test
    void shouldReturnPaginatedTimeline() {
        var response = restTemplate.exchange("/api/v1/timeline?page=0&size=10",
                HttpMethod.GET, new HttpEntity<>(authHeaders()),
                TimelineResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().page()).isZero();
        assertThat(response.getBody().size()).isEqualTo(10);
        assertThat(response.getBody().totalItems()).isZero();
        assertThat(response.getBody().totalPages()).isZero();
    }

    @Test
    void shouldRequireAuthentication() {
        var response = restTemplate.exchange("/api/v1/timeline",
                HttpMethod.GET, null, String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
