package com.weekdays.api.calendar;

import static org.assertj.core.api.Assertions.assertThat;

import com.weekdays.api.auth.AuthResponse;
import com.weekdays.api.auth.RefreshTokenRepository;
import com.weekdays.api.auth.RegisterRequest;
import com.weekdays.api.user.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
class CalendarControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private CalendarRepository calendarRepository;

    private String token;
    private String otherToken;
    private HttpHeaders auth;

    private static class HttpHeaders extends org.springframework.http.HttpHeaders {
        HttpHeaders(String bearerToken) {
            setBearerAuth(bearerToken);
        }
    }

    @BeforeEach
    void setUp() {
        calendarRepository.deleteAll();
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
    }

    @Test
    void shouldCreateAndRetrieveEvent() {
        var createRequest = new CreateEventRequest("Sprint Planning", "Plan the sprint",
                CalendarEventType.meeting,
                LocalDateTime.of(2026, 4, 15, 9, 0),
                LocalDateTime.of(2026, 4, 15, 10, 0),
                false, "indigo", "Conference Room", null, null);

        var createResponse = restTemplate.exchange("/api/v1/calendar",
                HttpMethod.POST, new HttpEntity<>(createRequest, auth),
                EventResponse.class);

        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        var created = createResponse.getBody();
        assertThat(created.title()).isEqualTo("Sprint Planning");
        assertThat(created.eventType()).isEqualTo(CalendarEventType.meeting);
        assertThat(created.location()).isEqualTo("Conference Room");

        var getResponse = restTemplate.exchange("/api/v1/calendar/" + created.id(),
                HttpMethod.GET, new HttpEntity<>(auth), EventResponse.class);
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody().title()).isEqualTo("Sprint Planning");
    }

    @Test
    void shouldEnforceUserIsolation() {
        var createRequest = new CreateEventRequest("Alice's Event", "",
                CalendarEventType.reminder,
                LocalDateTime.of(2026, 4, 15, 12, 0), null, true, "sky", "", null, null);
        var aliceEvent = restTemplate.exchange("/api/v1/calendar",
                HttpMethod.POST, new HttpEntity<>(createRequest, auth),
                EventResponse.class).getBody();

        var bobGet = restTemplate.exchange("/api/v1/calendar/" + aliceEvent.id(),
                HttpMethod.GET, new HttpEntity<>(new HttpHeaders(otherToken)),
                ProblemDetail.class);
        assertThat(bobGet.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void shouldUpdateEvent() {
        var create = new CreateEventRequest("Original", "Original desc",
                CalendarEventType.meeting,
                LocalDateTime.of(2026, 4, 15, 10, 0),
                LocalDateTime.of(2026, 4, 15, 11, 0),
                false, "indigo", "", null, null);
        var created = restTemplate.exchange("/api/v1/calendar",
                HttpMethod.POST, new HttpEntity<>(create, auth),
                EventResponse.class).getBody();

        var update = new UpdateEventRequest("Updated", "Updated desc",
                CalendarEventType.milestone,
                LocalDateTime.of(2026, 5, 1, 14, 0), null, true, "amber", "", null, null);
        var updateResponse = restTemplate.exchange("/api/v1/calendar/" + created.id(),
                HttpMethod.PUT, new HttpEntity<>(update, auth),
                EventResponse.class);

        assertThat(updateResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(updateResponse.getBody().title()).isEqualTo("Updated");
        assertThat(updateResponse.getBody().eventType()).isEqualTo(CalendarEventType.milestone);
        assertThat(updateResponse.getBody().allDay()).isTrue();
    }

    @Test
    void shouldDeleteEvent() {
        var create = new CreateEventRequest("Delete Me", "",
                CalendarEventType.reminder,
                LocalDateTime.of(2026, 4, 15, 8, 0), null, true, "sky", "", null, null);
        var created = restTemplate.exchange("/api/v1/calendar",
                HttpMethod.POST, new HttpEntity<>(create, auth),
                EventResponse.class).getBody();

        var deleteResponse = restTemplate.exchange("/api/v1/calendar/" + created.id(),
                HttpMethod.DELETE, new HttpEntity<>(auth), Void.class);
        assertThat(deleteResponse.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        var getResponse = restTemplate.exchange("/api/v1/calendar/" + created.id(),
                HttpMethod.GET, new HttpEntity<>(auth), ProblemDetail.class);
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void shouldQueryMonthEvents() {
        restTemplate.exchange("/api/v1/calendar",
                HttpMethod.POST, new HttpEntity<>(
                        new CreateEventRequest("Event 1", "", CalendarEventType.task,
                                LocalDateTime.of(2026, 4, 10, 0, 0), null, true, "indigo", "", null, null), auth),
                EventResponse.class);
        restTemplate.exchange("/api/v1/calendar",
                HttpMethod.POST, new HttpEntity<>(
                        new CreateEventRequest("Event 2", "", CalendarEventType.meeting,
                                LocalDateTime.of(2026, 4, 20, 14, 0), null, false, "emerald", "", null, null), auth),
                EventResponse.class);
        restTemplate.exchange("/api/v1/calendar",
                HttpMethod.POST, new HttpEntity<>(
                        new CreateEventRequest("Event 3", "", CalendarEventType.milestone,
                                LocalDateTime.of(2026, 5, 1, 0, 0), null, true, "amber", "", null, null), auth),
                EventResponse.class);

        var monthResponse = restTemplate.exchange("/api/v1/calendar/month?year=2026&month=4",
                HttpMethod.GET, new HttpEntity<>(auth),
                new ParameterizedTypeReference<EventResponse[]>() {});
        assertThat(monthResponse.getBody()).hasSize(2);
    }

    @Test
    void shouldQueryDayEvents() {
        restTemplate.exchange("/api/v1/calendar",
                HttpMethod.POST, new HttpEntity<>(
                        new CreateEventRequest("Morning standup", "", CalendarEventType.meeting,
                                LocalDateTime.of(2026, 4, 15, 9, 0),
                                LocalDateTime.of(2026, 4, 15, 9, 30), false, "indigo", "", null, null), auth),
                EventResponse.class);
        restTemplate.exchange("/api/v1/calendar",
                HttpMethod.POST, new HttpEntity<>(
                        new CreateEventRequest("Sprint review", "", CalendarEventType.meeting,
                                LocalDateTime.of(2026, 4, 15, 15, 0),
                                LocalDateTime.of(2026, 4, 15, 16, 0), false, "emerald", "", null, null), auth),
                EventResponse.class);

        var dayResponse = restTemplate.exchange("/api/v1/calendar/day?date=2026-04-15",
                HttpMethod.GET, new HttpEntity<>(auth),
                new ParameterizedTypeReference<EventResponse[]>() {});
        assertThat(dayResponse.getBody()).hasSize(2);
    }

    @Test
    void shouldRejectUnauthenticatedAccess() {
        var response = restTemplate.exchange("/api/v1/calendar",
                HttpMethod.GET, null, String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void shouldRejectCreateWithBlankTitle() {
        var request = new CreateEventRequest("", "desc", CalendarEventType.task,
                LocalDateTime.now(), null, true, "indigo", "", null, null);
        var response = restTemplate.exchange("/api/v1/calendar",
                HttpMethod.POST, new HttpEntity<>(request, auth),
                ProblemDetail.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void shouldReturnEmptyListWhenNoEvents() {
        var response = restTemplate.exchange("/api/v1/calendar",
                HttpMethod.GET, new HttpEntity<>(auth),
                new ParameterizedTypeReference<EventResponse[]>() {});
        assertThat(response.getBody()).isEmpty();
    }
}
