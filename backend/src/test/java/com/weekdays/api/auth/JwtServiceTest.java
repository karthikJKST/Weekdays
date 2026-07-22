package com.weekdays.api.auth;

import static org.assertj.core.api.Assertions.assertThat;

import com.weekdays.api.user.User;
import com.weekdays.api.user.UserRole;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private static final String SECRET = "test-secret-key-that-is-at-least-thirty-two-characters-long";
    private static final long ACCESS_TOKEN_MINUTES = 15;
    private static final long REFRESH_TOKEN_DAYS = 14;

    private JwtService jwtService;
    private User user;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, ACCESS_TOKEN_MINUTES, REFRESH_TOKEN_DAYS);
        user = new User(UUID.randomUUID(), "Test User", "test@example.com", "hashed-password", UserRole.OWNER);
    }

    @Test
    void shouldCreateAccessToken() {
        String token = jwtService.createAccessToken(user);

        assertThat(token).isNotBlank();
        assertThat(token).contains(".");
        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    void shouldExtractEmailFromToken() {
        String token = jwtService.createAccessToken(user);

        String email = jwtService.extractEmail(token);

        assertThat(email).isEqualTo("test@example.com");
    }

    @Test
    void shouldExtractUserIdFromToken() {
        String token = jwtService.createAccessToken(user);

        UUID userId = jwtService.extractUserId(token);

        assertThat(userId).isEqualTo(user.getId());
    }

    @Test
    void shouldRejectMalformedToken() {
        assertThat(jwtService.isTokenValid("not-a-jwt")).isFalse();
    }

    @Test
    void shouldRejectTamperedToken() {
        String token = jwtService.createAccessToken(user);
        String tampered = token.substring(0, token.lastIndexOf('.') + 1) + "tampered";

        assertThat(jwtService.isTokenValid(tampered)).isFalse();
    }

    @Test
    void shouldRejectEmptyToken() {
        assertThat(jwtService.isTokenValid("")).isFalse();
    }

    @Test
    void shouldGenerateRawRefreshToken() {
        String token1 = jwtService.generateRawRefreshToken();
        String token2 = jwtService.generateRawRefreshToken();

        assertThat(token1).isNotBlank();
        assertThat(token1).hasSize(64); // 32 bytes = 64 hex chars
        assertThat(token1).isNotEqualTo(token2);
    }

    @Test
    void shouldHashRefreshToken() {
        String raw = "some-raw-refresh-token-value";

        String hash = jwtService.hashRefreshToken(raw);

        assertThat(hash).isNotBlank();
        assertThat(hash).hasSize(64); // SHA-256 = 32 bytes = 64 hex chars
    }

    @Test
    void shouldProduceConsistentHashForSameInput() {
        String raw = "test-token-value";

        String hash1 = jwtService.hashRefreshToken(raw);
        String hash2 = jwtService.hashRefreshToken(raw);

        assertThat(hash1).isEqualTo(hash2);
    }

    @Test
    void shouldProduceDifferentHashesForDifferentInputs() {
        String hash1 = jwtService.hashRefreshToken("token-a");
        String hash2 = jwtService.hashRefreshToken("token-b");

        assertThat(hash1).isNotEqualTo(hash2);
    }

    @Test
    void shouldReturnConfiguredRefreshTokenDays() {
        assertThat(jwtService.getRefreshTokenDays()).isEqualTo(14);
    }

    @Test
    void shouldExtractEmailOnlyFromOwnToken() {
        JwtService otherService = new JwtService("different-secret-key-that-is-also-thirty-two-chars!", 15, 14);
        String otherToken = otherService.createAccessToken(user);

        assertThat(jwtService.isTokenValid(otherToken)).isFalse();
    }

    @Test
    void shouldRejectExpiredToken() {
        // Create a JwtService with negative expiration so tokens are expired immediately
        JwtService shortLived = new JwtService(SECRET, -1, REFRESH_TOKEN_DAYS);
        String expiredToken = shortLived.createAccessToken(user);

        assertThat(shortLived.isTokenValid(expiredToken)).isFalse();
    }
}
