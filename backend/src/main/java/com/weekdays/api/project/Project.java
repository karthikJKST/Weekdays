package com.weekdays.api.project;

import com.weekdays.api.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ProjectStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ProjectPriority priority;

    @Column(nullable = false, length = 32)
    private String color;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(nullable = false)
    private boolean archived;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected Project() {}

    public Project(UUID id, User owner, String name, String description,
                   ProjectStatus status, ProjectPriority priority, String color,
                   LocalDate startDate, LocalDate dueDate) {
        this.id = id;
        this.owner = owner;
        this.name = name;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.color = color;
        this.startDate = startDate;
        this.dueDate = dueDate;
        this.archived = false;
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public User getOwner() { return owner; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public ProjectStatus getStatus() { return status; }
    public ProjectPriority getPriority() { return priority; }
    public String getColor() { return color; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getDueDate() { return dueDate; }
    public boolean isArchived() { return archived; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setStatus(ProjectStatus status) { this.status = status; }
    public void setPriority(ProjectPriority priority) { this.priority = priority; }
    public void setColor(String color) { this.color = color; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public void setArchived(boolean archived) { this.archived = archived; }
}
