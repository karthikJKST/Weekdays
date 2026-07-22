package com.weekdays.api.task;

import com.weekdays.api.project.Project;
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
@Table(name = "tasks")
public class Task {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskPriority priority;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "assignee_id")
    private UUID assigneeId;

    @Column(name = "assignee_name", length = 100)
    private String assigneeName;

    @Column(name = "estimated_hours", nullable = false)
    private double estimatedHours;

    @Column(name = "spent_hours", nullable = false)
    private double spentHours;

    @Column(nullable = false)
    private int position;

    @Column(nullable = false)
    private String labels;

    @Column(nullable = false)
    private String checklist;

    @Column(nullable = false)
    private String comments;

    @Column(nullable = false)
    private boolean archived;

    @Column(name = "archived_at")
    private Instant archivedAt;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected Task() {}

    public Task(UUID id, User owner, Project project, String title, String description,
                TaskStatus status, TaskPriority priority, LocalDate dueDate,
                UUID assigneeId, String assigneeName, double estimatedHours,
                String labels, String checklist, String comments) {
        this.id = id;
        this.owner = owner;
        this.project = project;
        this.title = title;
        this.description = description != null ? description : "";
        this.status = status;
        this.priority = priority;
        this.dueDate = dueDate;
        this.assigneeId = assigneeId;
        this.assigneeName = assigneeName;
        this.estimatedHours = estimatedHours;
        this.spentHours = 0;
        this.position = 0;
        this.labels = labels != null ? labels : "";
        this.checklist = checklist != null ? checklist : "[]";
        this.comments = comments != null ? comments : "[]";
        this.archived = false;
        this.archivedAt = null;
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
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public TaskStatus getStatus() { return status; }
    public TaskPriority getPriority() { return priority; }
    public LocalDate getDueDate() { return dueDate; }
    public UUID getAssigneeId() { return assigneeId; }
    public String getAssigneeName() { return assigneeName; }
    public double getEstimatedHours() { return estimatedHours; }
    public double getSpentHours() { return spentHours; }
    public int getPosition() { return position; }
    public String getLabels() { return labels; }
    public String getChecklist() { return checklist; }
    public String getComments() { return comments; }
    public boolean isArchived() { return archived; }
    public Instant getArchivedAt() { return archivedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setProject(Project project) { this.project = project; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setStatus(TaskStatus status) { this.status = status; }
    public void setPriority(TaskPriority priority) { this.priority = priority; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public void setAssigneeId(UUID assigneeId) { this.assigneeId = assigneeId; }
    public void setAssigneeName(String assigneeName) { this.assigneeName = assigneeName; }
    public void setEstimatedHours(double estimatedHours) { this.estimatedHours = estimatedHours; }
    public void setSpentHours(double spentHours) { this.spentHours = spentHours; }
    public void setPosition(int position) { this.position = position; }
    public void setLabels(String labels) { this.labels = labels; }
    public void setChecklist(String checklist) { this.checklist = checklist; }
    public void setComments(String comments) { this.comments = comments; }
    public void setArchived(boolean archived) { this.archived = archived; }
    public void setArchivedAt(Instant archivedAt) { this.archivedAt = archivedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
