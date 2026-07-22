package com.weekdays.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.weekdays.api.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtService, refreshTokenRepository);
    }

    @Test
    void shouldHandleDataIntegrityViolationOnRegister() {
        when(userRepository.existsByEmailIgnoreCase(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encoded-password");
        when(userRepository.save(any())).thenThrow(new DataIntegrityViolationException("unique constraint violation"));

        var request = new RegisterRequest("Test User", "test@example.com", "password123");

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("already exists")
                .satisfies(ex -> {
                    var statusEx = (ResponseStatusException) ex;
                    assertThat(statusEx.getStatusCode().value()).isEqualTo(409);
                });
    }
}
