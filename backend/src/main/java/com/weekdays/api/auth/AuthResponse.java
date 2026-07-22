package com.weekdays.api.auth;

import com.weekdays.api.user.User;
import java.util.UUID;

public record AuthResponse(String accessToken, String refreshToken, UserSummary user) {
    public record UserSummary(UUID id, String fullName, String email, String role) {
        public static UserSummary from(User user) {
            return new UserSummary(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
        }
    }
}
