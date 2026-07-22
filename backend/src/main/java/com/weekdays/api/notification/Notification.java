package com.weekdays.api.notification;

import com.weekdays.api.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(nullable = false, length = 32)
    private String type;

    @Column(length = 500)
    private String link;

    @Column(name = "is_read", nullable = false)
    private boolean isRead;

    @Column(nullable = false)
    private Instant createdAt;

    protected Notification() {}

    public Notification(UUID id, User owner, String title, String message, String type, String link) {
        this.id = id;
        this.owner = owner;
        this.title = title;
        this.message = message;
        this.type = type;
        this.link = link;
        this.isRead = false;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public User getOwner() { return owner; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getType() { return type; }
    public String getLink() { return link; }
    public boolean isRead() { return isRead; }
    public Instant getCreatedAt() { return createdAt; }

    public void setRead(boolean read) { isRead = read; }
}
