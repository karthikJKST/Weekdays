package com.weekdays.api.notification;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findAllByOwnerIdOrderByCreatedAtDesc(UUID ownerId);

    Optional<Notification> findByIdAndOwnerId(UUID id, UUID ownerId);

    long countByOwnerIdAndIsReadFalse(UUID ownerId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.owner.id = :ownerId AND n.isRead = false")
    void markAllAsReadByOwnerId(@Param("ownerId") UUID ownerId);
}
