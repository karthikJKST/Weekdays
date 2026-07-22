package com.weekdays.api.analytics;

import java.util.List;

public record AnalyticsResponse(
        Summary summary,
        List<StatusDistribution> statusDistribution,
        List<PriorityDistribution> priorityDistribution,
        List<ProjectHealthItem> projectHealth,
        List<TeamMemberWorkload> teamWorkload,
        List<RecentActivity> recentActivity
) {
    public record Summary(
            int totalProjects,
            int activeProjects,
            int completedProjects,
            int totalTasks,
            int completedTasks,
            int inProgressTasks,
            int overdueTasks,
            int upcomingTasks,
            int completionRate,
            int productivityScore,
            int tasksCompletedThisWeek,
            int tasksCompletedThisMonth,
            double totalEstimatedHours,
            double totalSpentHours,
            int totalMembers
    ) {}

    public record StatusDistribution(String label, int value, String color) {}
    public record PriorityDistribution(String label, int value, String color) {}
    public record ProjectHealthItem(String id, String name, String status, String color, int completion, int overdueTasks, int totalTasks) {}
    public record TeamMemberWorkload(String name, String initials, int taskCount, int completedCount, double estimatedHours, double spentHours) {}
    public record RecentActivity(String id, String type, String title, String projectName, String timestamp, String user) {}
}
