package com.weekdays.api.auth;

import com.weekdays.api.user.User;
import com.weekdays.api.user.UserRepository;
import com.weekdays.api.user.UserRole;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokens;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService,
                       RefreshTokenRepository refreshTokens) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokens = refreshTokens;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }
        try {
            User user = new User(UUID.randomUUID(), request.fullName().trim(), email,
                    passwordEncoder.encode(request.password()), UserRole.OWNER);
            users.save(user);
            return responseFor(user);
        } catch (DataIntegrityViolationException e) {
            log.warn("Duplicate registration attempt for email: {}", email);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = users.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }
        return responseFor(user);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        String hash = jwtService.hashRefreshToken(rawRefreshToken);
        RefreshToken token = refreshTokens.findByTokenHash(hash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token."));

        if (!token.isValid()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token has expired or been revoked.");
        }

        // Rotate: revoke old token, issue new one
        token.revoke();
        refreshTokens.save(token);

        return responseFor(token.getUser());
    }

    private AuthResponse responseFor(User user) {
        String rawRefreshToken = jwtService.generateRawRefreshToken();
        String hash = jwtService.hashRefreshToken(rawRefreshToken);

        RefreshToken token = new RefreshToken(
                UUID.randomUUID(),
                hash,
                user,
                Instant.now().plus(jwtService.getRefreshTokenDays(), ChronoUnit.DAYS));
        refreshTokens.save(token);

        return new AuthResponse(
                jwtService.createAccessToken(user),
                rawRefreshToken,
                AuthResponse.UserSummary.from(user));
    }
}
