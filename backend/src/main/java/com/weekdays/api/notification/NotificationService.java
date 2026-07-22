package com.weekdays.api.notification;

import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class NotificationService {

    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getAllNotifications(UUID ownerId) {
        return repository.findAllByOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream().map(NotificationResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID ownerId) {
        return repository.countByOwnerIdAndIsReadFalse(ownerId);
    }

    @Transactional
    public NotificationResponse markAsRead(UUID id, UUID ownerId) {
        Notification notification = repository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found."));
        notification.setRead(true);
        repository.save(notification);
        return NotificationResponse.from(notification);
    }

    @Transactional
    public void markAllAsRead(UUID ownerId) {
        repository.markAllAsReadByOwnerId(ownerId);
    }
}
