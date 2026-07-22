package com.weekdays.api.timeline;

import com.weekdays.api.calendar.CalendarEvent;
import com.weekdays.api.calendar.CalendarEventType;
import com.weekdays.api.calendar.CalendarRepository;
import com.weekdays.api.project.Project;
import com.weekdays.api.project.ProjectRepository;
import com.weekdays.api.task.Task;
import com.weekdays.api.task.TaskRepository;
import com.weekdays.api.task.TaskStatus;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TimelineService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final CalendarRepository calendarRepository;

    public TimelineService(ProjectRepository projectRepository,
                           TaskRepository taskRepository,
                           CalendarRepository calendarRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.calendarRepository = calendarRepository;
    }

    @Transactional(readOnly = true)
    public TimelineResponse getTimeline(UUID ownerId, int page, int size) {
        List<TimelineResponse.TimelineActivity> allActivities = new ArrayList<>();

        // ── Project activities ────────────────────────
        List<Project> projects = projectRepository.findAllByOwnerIdOrderByUpdatedAtDesc(ownerId);
        for (Project p : projects) {
            allActivities.add(new TimelineResponse.TimelineActivity(
                    "proj-created-" + p.getId(),
                    "project_created",
                    p.getName(),
                    "Project created",
                    p.getId().toString(), p.getName(),
                    null, null,
                    p.getCreatedAt().toString(),
                    "System", "folder-plus", p.getColor()));

            allActivities.add(new TimelineResponse.TimelineActivity(
                    "proj-updated-" + p.getId(),
                    "project_updated",
                    p.getName(),
                    "Project updated — " + p.getStatus().name().replace('_', ' '),
                    p.getId().toString(), p.getName(),
                    null, null,
                    p.getUpdatedAt().toString(),
                    "System", "edit", p.getColor()));

            if (p.getStatus().name().equals("done")) {
                allActivities.add(new TimelineResponse.TimelineActivity(
                        "proj-completed-" + p.getId(),
                        "project_completed",
                        p.getName(),
                        "Project completed!",
                        p.getId().toString(), p.getName(),
                        null, null,
                        p.getCreatedAt().toString(),
                        "System", "check-circle", "#10b981"));
            }
        }

        // ── Task activities ───────────────────────────
        List<Task> tasks = taskRepository.findAllByOwnerIdOrderByUpdatedAtDesc(ownerId);
        for (Task t : tasks) {
            String actor = t.getAssigneeName() != null ? t.getAssigneeName() : "System";

            allActivities.add(new TimelineResponse.TimelineActivity(
                    "task-created-" + t.getId(),
                    "task_created",
                    t.getTitle(),
                    "Task created in " + t.getProject().getName(),
                    t.getProject().getId().toString(), t.getProject().getName(),
                    t.getId().toString(), null,
                    t.getCreatedAt().toString(),
                    actor, "plus-circle", t.getProject().getColor()));

            if (t.getUpdatedAt() != null && !t.getUpdatedAt().equals(t.getCreatedAt())) {
                String statusDesc = t.getStatus() == TaskStatus.done
                        ? "Marked as done"
                        : "Status: " + t.getStatus().name().replace('_', ' ');
                allActivities.add(new TimelineResponse.TimelineActivity(
                        "task-updated-" + t.getId(),
                        "task_updated",
                        t.getTitle(),
                        statusDesc + " in " + t.getProject().getName(),
                        t.getProject().getId().toString(), t.getProject().getName(),
                        t.getId().toString(), null,
                        t.getUpdatedAt().toString(),
                        actor, "edit", t.getProject().getColor()));
            }

            if (t.getStatus() == TaskStatus.done) {
                allActivities.add(new TimelineResponse.TimelineActivity(
                        "task-completed-" + t.getId(),
                        "task_completed",
                        t.getTitle(),
                        "Task completed in " + t.getProject().getName(),
                        t.getProject().getId().toString(), t.getProject().getName(),
                        t.getId().toString(), null,
                        t.getUpdatedAt().toString(),
                        actor, "check-circle", "#10b981"));
            }
        }

        // ── Calendar event activities ─────────────────
        List<CalendarEvent> events = calendarRepository.findAllByOwnerIdOrderByStartTimeAsc(ownerId);
        for (CalendarEvent e : events) {
            String actor = "System";
            String projName = e.getProject() != null ? e.getProject().getName() : e.getTitle();
            String projId = e.getProject() != null ? e.getProject().getId().toString() : null;

            allActivities.add(new TimelineResponse.TimelineActivity(
                    "cal-created-" + e.getId(),
                    "calendar_event_created",
                    e.getTitle(),
                    "Calendar event: " + e.getEventType().name().replace('_', ' '),
                    projId, projName,
                    e.getTask() != null ? e.getTask().getId().toString() : null,
                    e.getId().toString(),
                    e.getCreatedAt().toString(),
                    actor, "calendar", e.getColor()));

            if (e.getUpdatedAt() != null && !e.getUpdatedAt().equals(e.getCreatedAt())) {
                allActivities.add(new TimelineResponse.TimelineActivity(
                        "cal-updated-" + e.getId(),
                        "calendar_event_updated",
                        e.getTitle(),
                        "Calendar event updated",
                        projId, projName,
                        e.getTask() != null ? e.getTask().getId().toString() : null,
                        e.getId().toString(),
                        e.getUpdatedAt().toString(),
                        actor, "edit", e.getColor()));
            }
        }

        // Sort newest first
        allActivities.sort(Comparator.comparing(
                (TimelineResponse.TimelineActivity a) -> a.timestamp()).reversed());

        // Paginate
        long total = allActivities.size();
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, (int) total);
        List<TimelineResponse.TimelineActivity> pageItems = fromIndex < total
                ? allActivities.subList(fromIndex, toIndex)
                : List.of();

        int totalPages = (int) Math.ceil((double) total / size);

        return new TimelineResponse(pageItems, page, size, totalPages, total);
    }
}
