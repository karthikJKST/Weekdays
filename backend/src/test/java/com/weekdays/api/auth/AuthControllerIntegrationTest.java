package com.weekdays.api.auth;

import static org.assertj.core.api.Assertions.assertThat;

import com.weekdays.api.user.UserRepository;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @BeforeEach
    void setUp() {
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void shouldRegisterUser() {
        var request = new RegisterRequest("John Doe", "john@example.com", "password123");

        var response = restTemplate.postForEntity("/api/v1/auth/register", request, AuthResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().accessToken()).isNotBlank();
        assertThat(response.getBody().refreshToken()).isNotBlank();
        assertThat(response.getBody().user().fullName()).isEqualTo("John Doe");
        assertThat(response.getBody().user().email()).isEqualTo("john@example.com");
        assertThat(response.getBody().user().role()).isEqualTo("OWNER");
    }

    @Test
    void shouldRejectDuplicateEmail() {
        restTemplate.postForEntity("/api/v1/auth/register",
                new RegisterRequest("John", "john@example.com", "password123"), AuthResponse.class);

        var response = restTemplate.postForEntity("/api/v1/auth/register",
                new RegisterRequest("John Dup", "john@example.com", "password456"), ProblemDetail.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getDetail()).contains("already exists");
    }

    @Test
    void shouldLoginWithValidCredentials() {
        restTemplate.postForEntity("/api/v1/auth/register",
                new RegisterRequest("John", "john@example.com", "password123"), AuthResponse.class);

        var response = restTemplate.postForEntity("/api/v1/auth/login",
                new LoginRequest("john@example.com", "password123"), AuthResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().accessToken()).isNotBlank();
        assertThat(response.getBody().refreshToken()).isNotBlank();
        assertThat(response.getBody().user().email()).isEqualTo("john@example.com");
    }

    @Test
    void shouldRejectInvalidPassword() {
        restTemplate.postForEntity("/api/v1/auth/register",
                new RegisterRequest("John", "john@example.com", "password123"), AuthResponse.class);

        var response = restTemplate.postForEntity("/api/v1/auth/login",
                new LoginRequest("john@example.com", "wrongpassword"), ProblemDetail.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getDetail()).contains("Invalid email or password");
    }

    @Test
    void shouldRejectLoginForNonexistentEmail() {
        var response = restTemplate.postForEntity("/api/v1/auth/login",
                new LoginRequest("nobody@example.com", "password123"), ProblemDetail.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getDetail()).contains("Invalid email or password");
    }

    @Test
    void shouldReturnCurrentUserWithValidToken() {
        var registerResponse = restTemplate.postForEntity("/api/v1/auth/register",
                new RegisterRequest("Jane", "jane@example.com", "password123"), AuthResponse.class);
        String token = registerResponse.getBody().accessToken();

        var headers = new HttpHeaders();
        headers.setBearerAuth(token);
        var request = new HttpEntity<>(headers);

        var response = restTemplate.exchange("/api/v1/auth/me", HttpMethod.GET, request,
                AuthResponse.UserSummary.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().email()).isEqualTo("jane@example.com");
        assertThat(response.getBody().fullName()).isEqualTo("Jane");
        assertThat(response.getBody().role()).isEqualTo("OWNER");
    }

    @Test
    void shouldReturn401WhenAccessingMeWithoutToken() {
        var response = restTemplate.exchange("/api/v1/auth/me", HttpMethod.GET, null, String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void shouldReturn401WhenAccessingMeWithInvalidToken() {
        var headers = new HttpHeaders();
        headers.setBearerAuth("eyJhbGciOiJIUzI1NiJ9.invalid-token");
        var request = new HttpEntity<>(headers);

        var response = restTemplate.exchange("/api/v1/auth/me", HttpMethod.GET, request, String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void healthEndpointShouldBePublic() {
        var response = restTemplate.getForEntity("/api/v1/health", Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("status")).isEqualTo("ok");
    }

    @SuppressWarnings("unchecked")
    @Test
    void healthEndpointShouldReturnCorrectResponseShape() {
        var response = restTemplate.getForEntity("/api/v1/health", Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).containsKeys("status", "service", "timestamp");
        assertThat(response.getBody().get("status")).isEqualTo("ok");
        assertThat(response.getBody().get("service")).isEqualTo("weekdays-api");
        assertThat(response.getBody().get("timestamp")).isNotNull();
        assertThat(response.getBody().get("timestamp").toString()).isNotBlank();
    }

    @Test
    void shouldRejectRegisterWithInvalidEmail() {
        var request = new RegisterRequest("John", "not-an-email", "password123");

        var response = restTemplate.postForEntity("/api/v1/auth/register", request, ProblemDetail.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getTitle()).isEqualTo("Validation Failed");
    }

    @Test
    void shouldRejectRegisterWithShortPassword() {
        var request = new RegisterRequest("John", "john@example.com", "short");

        var response = restTemplate.postForEntity("/api/v1/auth/register", request, ProblemDetail.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getTitle()).isEqualTo("Validation Failed");
    }

    @Test
    void shouldRejectRegisterWithBlankName() {
        var request = new RegisterRequest("", "john@example.com", "password123");

        var response = restTemplate.postForEntity("/api/v1/auth/register", request, ProblemDetail.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void shouldRefreshTokenSuccessfully() {
        var registerResponse = restTemplate.postForEntity("/api/v1/auth/register",
                new RegisterRequest("Alice", "alice@example.com", "password123"), AuthResponse.class);
        String refreshToken = registerResponse.getBody().refreshToken();

        var response = restTemplate.postForEntity("/api/v1/auth/refresh",
                new RefreshTokenRequest(refreshToken), AuthResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().accessToken()).isNotBlank();
        assertThat(response.getBody().refreshToken()).isNotBlank();
        assertThat(response.getBody().user().email()).isEqualTo("alice@example.com");

        // Verify the old refresh token is now revoked and the new one is different
        assertThat(response.getBody().refreshToken()).isNotEqualTo(refreshToken);
    }

    @Test
    void shouldRejectRefreshWithInvalidToken() {
        var response = restTemplate.postForEntity("/api/v1/auth/refresh",
                new RefreshTokenRequest("invalid-refresh-token-value"), ProblemDetail.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getDetail()).contains("Invalid refresh token");
    }

    @Test
    void shouldRejectRefreshWithEmptyToken() {
        var response = restTemplate.postForEntity("/api/v1/auth/refresh",
                new RefreshTokenRequest(""), ProblemDetail.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void shouldNotReuseRevokedRefreshToken() {
        var registerResponse = restTemplate.postForEntity("/api/v1/auth/register",
                new RegisterRequest("Bob", "bob@example.com", "password123"), AuthResponse.class);
        String refreshToken = registerResponse.getBody().refreshToken();

        // First refresh - succeeds
        restTemplate.postForEntity("/api/v1/auth/refresh",
                new RefreshTokenRequest(refreshToken), AuthResponse.class);

        // Second refresh with same token - should fail (token was rotated/revoked)
        var secondResponse = restTemplate.postForEntity("/api/v1/auth/refresh",
                new RefreshTokenRequest(refreshToken), ProblemDetail.class);

        assertThat(secondResponse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
