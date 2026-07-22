package com.weekdays.api.calendar;

import com.weekdays.api.project.Project;
import com.weekdays.api.task.Task;
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
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "calendar_events")
public class CalendarEvent {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 30)
    private CalendarEventType eventType;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "all_day", nullable = false)
    private boolean allDay;

    @Column(nullable = false, length = 32)
    private String color;

    @Column(nullable = false, length = 200)
    private String location;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected CalendarEvent() {}

    public CalendarEvent(UUID id, User owner, Project project, Task task,
                         String title, String description, CalendarEventType eventType,
                         LocalDateTime startTime, LocalDateTime endTime,
                         boolean allDay, String color, String location) {
        this.id = id;
        this.owner = owner;
        this.project = project;
        this.task = task;
        this.title = title;
        this.description = description != null ? description : "";
        this.eventType = eventType;
        this.startTime = startTime;
        this.endTime = endTime;
        this.allDay = allDay;
        this.color = color != null ? color : "indigo";
        this.location = location != null ? location : "";
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
    public Project getProject() { return project; }
    public Task getTask() { return task; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public CalendarEventType getEventType() { return eventType; }
    public LocalDateTime getStartTime() { return startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public boolean isAllDay() { return allDay; }
    public String getColor() { return color; }
    public String getLocation() { return location; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setProject(Project project) { this.project = project; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setEventType(CalendarEventType eventType) { this.eventType = eventType; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public void setAllDay(boolean allDay) { this.allDay = allDay; }
    public void setColor(String color) { this.color = color; }
    public void setLocation(String location) { this.location = location; }
}
