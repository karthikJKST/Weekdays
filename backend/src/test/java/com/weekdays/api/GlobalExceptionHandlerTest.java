package com.weekdays.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.server.ResponseStatusException;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void shouldHandleResponseStatusException() {
        var ex = new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found");

        ProblemDetail result = handler.handleResponseStatusException(ex);

        assertThat(result.getStatus()).isEqualTo(404);
        assertThat(result.getDetail()).isEqualTo("Resource not found");
    }

    @Test
    void shouldHandleConflictResponseStatusException() {
        var ex = new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");

        ProblemDetail result = handler.handleResponseStatusException(ex);

        assertThat(result.getStatus()).isEqualTo(409);
        assertThat(result.getDetail()).contains("already exists");
    }

    @Test
    void shouldHandleUnauthorizedResponseStatusException() {
        var ex = new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");

        ProblemDetail result = handler.handleResponseStatusException(ex);

        assertThat(result.getStatus()).isEqualTo(401);
        assertThat(result.getDetail()).isEqualTo("Invalid email or password.");
    }

    @Test
    void shouldHandleValidationException() {
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(
                new FieldError("object", "email", "must be a well-formed email address"),
                new FieldError("object", "password", "size must be between 8 and 72")));

        var ex = new MethodArgumentNotValidException(null, bindingResult);

        ProblemDetail result = handler.handleValidation(ex);

        assertThat(result.getStatus()).isEqualTo(400);
        assertThat(result.getTitle()).isEqualTo("Validation Failed");
        assertThat(result.getProperties()).containsKey("errors");

        @SuppressWarnings("unchecked")
        var errors = (java.util.Map<String, String>) result.getProperties().get("errors");
        assertThat(errors)
                .containsEntry("email", "must be a well-formed email address")
                .containsEntry("password", "size must be between 8 and 72");
    }

    @Test
    void shouldHandleValidationWithSingleError() {
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(
                new FieldError("object", "fullName", "must not be blank")));

        var ex = new MethodArgumentNotValidException(null, bindingResult);

        ProblemDetail result = handler.handleValidation(ex);

        assertThat(result.getStatus()).isEqualTo(400);
        @SuppressWarnings("unchecked")
        var errors = (java.util.Map<String, String>) result.getProperties().get("errors");
        assertThat(errors).containsOnlyKeys("fullName");
    }

    @Test
    void shouldHandleGenericException() {
        var ex = new RuntimeException("Unexpected database error");

        ProblemDetail result = handler.handleGeneral(ex);

        assertThat(result.getStatus()).isEqualTo(500);
        assertThat(result.getTitle()).isEqualTo("Internal Server Error");
        assertThat(result.getDetail()).isEqualTo("An unexpected error occurred.");
    }

    @Test
    void shouldNotLeakExceptionDetailsInGenericHandler() {
        var ex = new RuntimeException("Secret internal details");

        ProblemDetail result = handler.handleGeneral(ex);

        assertThat(result.getDetail()).isEqualTo("An unexpected error occurred.");
        assertThat(result.getDetail()).doesNotContain("Secret");
    }
}
