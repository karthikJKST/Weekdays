package com.weekdays.api.notification;

import com.weekdays.api.auth.UserDetailsImpl;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationResponse> getAllNotifications(
            @AuthenticationPrincipal UserDetailsImpl principal) {
        return notificationService.getAllNotifications(principal.getUser().getId());
    }

    @GetMapping("/unread-count")
    public long getUnreadCount(
            @AuthenticationPrincipal UserDetailsImpl principal) {
        return notificationService.getUnreadCount(principal.getUser().getId());
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse markAsRead(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable UUID id) {
        return notificationService.markAsRead(id, principal.getUser().getId());
    }

    @PatchMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllAsRead(
            @AuthenticationPrincipal UserDetailsImpl principal) {
        notificationService.markAllAsRead(principal.getUser().getId());
    }
}
