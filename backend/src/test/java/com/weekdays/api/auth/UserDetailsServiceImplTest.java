package com.weekdays.api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.weekdays.api.user.User;
import com.weekdays.api.user.UserRepository;
import com.weekdays.api.user.UserRole;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock
    private UserRepository userRepository;

    private UserDetailsServiceImpl userDetailsService;

    @BeforeEach
    void setUp() {
        userDetailsService = new UserDetailsServiceImpl(userRepository);
    }

    @Test
    void shouldLoadUserByEmail() {
        User user = new User(UUID.randomUUID(), "Test User", "test@example.com", "hashed", UserRole.DEVELOPER);
        when(userRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(user));

        var userDetails = userDetailsService.loadUserByUsername("test@example.com");

        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo("test@example.com");
        assertThat(userDetails.getPassword()).isEqualTo("hashed");
        assertThat(userDetails.getAuthorities())
                .extracting(a -> a.getAuthority())
                .containsExactly("ROLE_DEVELOPER");
    }

    @Test
    void shouldLoadUserWithCaseInsensitiveEmail() {
        User user = new User(UUID.randomUUID(), "Test User", "Test@Example.com", "hashed", UserRole.ADMIN);
        when(userRepository.findByEmailIgnoreCase("TEST@EXAMPLE.COM")).thenReturn(Optional.of(user));

        var userDetails = userDetailsService.loadUserByUsername("TEST@EXAMPLE.COM");

        assertThat(userDetails.getUsername()).isEqualTo("Test@Example.com");
        assertThat(userDetails.getAuthorities())
                .extracting(a -> a.getAuthority())
                .containsExactly("ROLE_ADMIN");
    }

    @Test
    void shouldThrowWhenUserNotFound() {
        when(userRepository.findByEmailIgnoreCase("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("unknown@example.com"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("unknown@example.com");
    }

    @Test
    void shouldReturnUserDetailsImplInstance() {
        User user = new User(UUID.randomUUID(), "Test User", "test@example.com", "hashed", UserRole.VIEWER);
        when(userRepository.findByEmailIgnoreCase("test@example.com")).thenReturn(Optional.of(user));

        var userDetails = userDetailsService.loadUserByUsername("test@example.com");

        assertThat(userDetails).isInstanceOf(UserDetailsImpl.class);
        assertThat(((UserDetailsImpl) userDetails).getUser()).isSameAs(user);
    }
}
