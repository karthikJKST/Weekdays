package com.weekdays.api.analytics;

import com.weekdays.api.project.Project;
import com.weekdays.api.project.ProjectRepository;
import com.weekdays.api.task.Task;
import com.weekdays.api.task.TaskPriority;
import com.weekdays.api.task.TaskRepository;
import com.weekdays.api.task.TaskStatus;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    public AnalyticsService(ProjectRepository projectRepository, TaskRepository taskRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
    }

    public AnalyticsResponse getDashboard(UUID ownerId) {
        // Aggregation queries for efficiency
        long totalProjects = projectRepository.countByOwnerIdAndArchivedFalse(ownerId);
        long activeProjects = projectRepository.countActiveByOwnerId(ownerId);
        long completedProjects = projectRepository.countCompletedByOwnerId(ownerId);

        // Load tasks for detailed analysis
        List<Task> tasks = taskRepository.findAllByOwnerIdAndArchivedFalseOrderByUpdatedAtDesc(ownerId);

        long totalTasks = tasks.size();
        long completedTasks = taskRepository.countCompletedByOwnerId(ownerId);
        long inProgressTasks = tasks.stream().filter(t -> t.getStatus() == TaskStatus.in_progress).count();

        LocalDate today = LocalDate.now();
        long overdueTasks = tasks.stream()
                .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(today) && t.getStatus() != TaskStatus.done)
                .count();
        long upcomingTasks = tasks.stream()
                .filter(t -> t.getDueDate() != null && (t.getDueDate().isEqual(today) || t.getDueDate().isAfter(today)) && t.getStatus() != TaskStatus.done)
                .count();

        int completionRate = totalTasks > 0 ? (int) Math.round((completedTasks * 100.0) / totalTasks) : 0;

        // Productivity score: weighted combination of completion rate, overdue ratio, and velocity
        double overdueRatio = totalTasks > 0 ? (double) overdueTasks / totalTasks : 0;
        int productivityScore = Math.max(0, Math.min(100,
                (int) Math.round(completionRate * 0.5 + (1 - overdueRatio) * 50)));

        // Tasks completed this week / this month (based on updatedAt, not dueDate)
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate monthStart = today.withDayOfMonth(1);
        long tasksCompletedThisWeek = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.done && t.getUpdatedAt() != null)
                .filter(t -> {
                    LocalDate updated = t.getUpdatedAt().atZone(java.time.ZoneOffset.UTC).toLocalDate();
                    return !updated.isBefore(weekStart) && !updated.isAfter(today);
                })
                .count();
        long tasksCompletedThisMonth = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.done && t.getUpdatedAt() != null)
                .filter(t -> {
                    LocalDate updated = t.getUpdatedAt().atZone(java.time.ZoneOffset.UTC).toLocalDate();
                    return !updated.isBefore(monthStart) && !updated.isAfter(today);
                })
                .count();

        Double sumEstimatedHours = taskRepository.sumEstimatedHoursByOwnerId(ownerId);
        Double sumSpentHours = taskRepository.sumSpentHoursByOwnerId(ownerId);
        double totalEstimatedHours = sumEstimatedHours != null ? sumEstimatedHours : 0;
        double totalSpentHours = sumSpentHours != null ? sumSpentHours : 0;

        // Unique members from task assignees
        int totalMembers = (int) tasks.stream()
                .filter(t -> t.getAssigneeName() != null && !t.getAssigneeName().isBlank())
                .map(Task::getAssigneeName)
                .distinct()
                .count();

        var summary = new AnalyticsResponse.Summary(
                (int) totalProjects, (int) activeProjects, (int) completedProjects,
                (int) totalTasks, (int) completedTasks, (int) inProgressTasks,
                (int) overdueTasks, (int) upcomingTasks, completionRate, productivityScore,
                (int) tasksCompletedThisWeek, (int) tasksCompletedThisMonth,
                totalEstimatedHours, totalSpentHours, totalMembers);

        // Status distribution using aggregation query
        Map<String, Integer> statusCounts = new LinkedHashMap<>();
        statusCounts.put("todo", 0);
        statusCounts.put("in_progress", 0);
        statusCounts.put("in_review", 0);
        statusCounts.put("done", 0);
        for (var entry : taskRepository.countByStatusGrouped(ownerId)) {
            statusCounts.put(((TaskStatus) entry[0]).name(), ((Number) entry[1]).intValue());
        }
        var statusDist = List.of(
                new AnalyticsResponse.StatusDistribution("Todo", statusCounts.get("todo"), "#64748b"),
                new AnalyticsResponse.StatusDistribution("In Progress", statusCounts.get("in_progress"), "#6366f1"),
                new AnalyticsResponse.StatusDistribution("In Review", statusCounts.get("in_review"), "#f59e0b"),
                new AnalyticsResponse.StatusDistribution("Done", statusCounts.get("done"), "#10b981"));

        // Priority distribution using aggregation query
        Map<String, Integer> priorityCounts = new LinkedHashMap<>();
        priorityCounts.put("urgent", 0);
        priorityCounts.put("high", 0);
        priorityCounts.put("medium", 0);
        priorityCounts.put("low", 0);
        priorityCounts.put("none", 0);
        for (var entry : taskRepository.countByPriorityGrouped(ownerId)) {
            priorityCounts.put(((TaskPriority) entry[0]).name(), ((Number) entry[1]).intValue());
        }
        var priorityDist = List.of(
                new AnalyticsResponse.PriorityDistribution("Urgent", priorityCounts.get("urgent"), "#ef4444"),
                new AnalyticsResponse.PriorityDistribution("High", priorityCounts.get("high"), "#f97316"),
                new AnalyticsResponse.PriorityDistribution("Medium", priorityCounts.get("medium"), "#f59e0b"),
                new AnalyticsResponse.PriorityDistribution("Low", priorityCounts.get("low"), "#6366f1"),
                new AnalyticsResponse.PriorityDistribution("None", priorityCounts.get("none"), "#64748b"));

        // Project health
        List<Project> projects = projectRepository.findAllByOwnerIdAndArchivedFalseOrderByUpdatedAtDesc(ownerId);
        var projectHealth = new ArrayList<AnalyticsResponse.ProjectHealthItem>();
        for (Project p : projects) {
            var projectTasks = tasks.stream().filter(t -> t.getProject().getId().equals(p.getId())).toList();
            long projectOverdue = projectTasks.stream()
                    .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(today) && t.getStatus() != TaskStatus.done).count();
            int comp = projectTasks.isEmpty() ? 0 :
                    (int) Math.round((projectTasks.stream().filter(t -> t.getStatus() == TaskStatus.done).count() * 100.0) / projectTasks.size());
            projectHealth.add(new AnalyticsResponse.ProjectHealthItem(
                    p.getId().toString(), p.getName(), p.getStatus().name(), p.getColor(),
                    comp, (int) projectOverdue, projectTasks.size()));
        }

        // Team workload
        var workloadMap = new LinkedHashMap<String, WorkloadAccumulator>();
        for (Task t : tasks) {
            if (t.getAssigneeName() != null && !t.getAssigneeName().isBlank()) {
                workloadMap.computeIfAbsent(t.getAssigneeName(), WorkloadAccumulator::new)
                        .add(t.getStatus() == TaskStatus.done ? 1 : 0, 1, t.getEstimatedHours(), t.getSpentHours());
            }
        }
        var teamWorkload = workloadMap.values().stream()
                .map(w -> new AnalyticsResponse.TeamMemberWorkload(
                        w.name, initials(w.name), w.taskCount, w.completedCount, w.estimatedHours, w.spentHours))
                .sorted((a, b) -> b.taskCount() - a.taskCount())
                .toList();

        // Recent activity (last 7 days)
        var activity = new ArrayList<AnalyticsResponse.RecentActivity>();
        Instant sevenDaysAgo = Instant.now().minus(7, ChronoUnit.DAYS);
        for (Task t : tasks) {
            if (t.getUpdatedAt().isAfter(sevenDaysAgo)) {
                String type = t.getStatus() == TaskStatus.done ? "task_completed" : "task_updated";
                activity.add(new AnalyticsResponse.RecentActivity(
                        "act-" + t.getId(), type, t.getTitle(),
                        t.getProject().getName(), t.getUpdatedAt().toString(),
                        t.getAssigneeName() != null ? t.getAssigneeName() : "System"));
            }
        }
        for (Project p : projects) {
            if (p.getCreatedAt().isAfter(sevenDaysAgo)) {
                activity.add(new AnalyticsResponse.RecentActivity(
                        "act-proj-" + p.getId(), "project_created", p.getName(),
                        p.getName(), p.getCreatedAt().toString(), "System"));
            }
        }
        activity.sort((a, b) -> b.timestamp().compareTo(a.timestamp()));
        if (activity.size() > 20) activity.subList(20, activity.size()).clear();

        return new AnalyticsResponse(summary, statusDist, priorityDist, projectHealth, teamWorkload, activity);
    }

    private static String initials(String name) {
        if (name == null || name.isBlank()) return "?";
        String[] parts = name.trim().split("\\s+");
        return parts.length > 1
                ? (parts[0].charAt(0) + "" + parts[1].charAt(0)).toUpperCase()
                : name.trim().substring(0, Math.min(2, name.trim().length())).toUpperCase();
    }

    private static class WorkloadAccumulator {
        String name;
        int completedCount, taskCount;
        double estimatedHours, spentHours;
        WorkloadAccumulator(String name) { this.name = name; }
        void add(int completed, int count, double est, double spent) {
            this.completedCount += completed;
            this.taskCount += count;
            this.estimatedHours += est;
            this.spentHours += spent;
        }
    }
}
