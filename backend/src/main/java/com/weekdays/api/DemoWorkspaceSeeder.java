package com.weekdays.api;

import com.weekdays.api.calendar.CalendarEvent;
import com.weekdays.api.calendar.CalendarEventType;
import com.weekdays.api.calendar.CalendarRepository;
import com.weekdays.api.notification.Notification;
import com.weekdays.api.notification.NotificationRepository;
import com.weekdays.api.project.Project;
import com.weekdays.api.project.ProjectPriority;
import com.weekdays.api.project.ProjectRepository;
import com.weekdays.api.project.ProjectStatus;
import com.weekdays.api.task.Task;
import com.weekdays.api.task.TaskPriority;
import com.weekdays.api.task.TaskRepository;
import com.weekdays.api.task.TaskStatus;
import com.weekdays.api.user.User;
import com.weekdays.api.user.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("production")
public class DemoWorkspaceSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoWorkspaceSeeder.class);

    private static final String DEMO_EMAIL = "demo@weekdays.dev";

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final CalendarRepository calendarRepository;
    private final NotificationRepository notificationRepository;

    public DemoWorkspaceSeeder(UserRepository userRepository,
                               ProjectRepository projectRepository,
                               TaskRepository taskRepository,
                               CalendarRepository calendarRepository,
                               NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.calendarRepository = calendarRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Find the demo user — if not found, ProductionDemoSeeder hasn't run yet, skip
        User demo = userRepository.findByEmailIgnoreCase(DEMO_EMAIL).orElse(null);
        if (demo == null) {
            log.info("Demo user not found — skipping workspace seed.");
            return;
        }

        // Idempotency: check if demo workspace already exists
        if (!projectRepository.findAllByOwnerIdAndArchivedFalseOrderByUpdatedAtDesc(demo.getId()).isEmpty()) {
            log.info("Demo workspace already exists — skipping.");
            return;
        }

        var now = LocalDate.now();
        log.info("Seeding demo workspace...");

        // ═══════════════════════════════════════════════════
        // PROJECTS
        // ═══════════════════════════════════════════════════

        record ProjectSeed(String name, String description, ProjectStatus status, ProjectPriority priority, String color, LocalDate dueDate) {}

        List<ProjectSeed> projectSeeds = List.of(
                new ProjectSeed("Job Hunt",
                        "Track job applications, interview preparation, resume updates and networking.",
                        ProjectStatus.in_progress, ProjectPriority.high, "blue", now.plusDays(45)),
                new ProjectSeed("WeekDays Improvements",
                        "Future enhancements planned for the WeekDays application.",
                        ProjectStatus.in_progress, ProjectPriority.medium, "purple", now.plusDays(60)),
                new ProjectSeed("Personal Learning",
                        "Learning Spring Boot, React, System Design and DSA.",
                        ProjectStatus.in_progress, ProjectPriority.medium, "green", now.plusDays(90))
        );

        List<Project> projects = projectSeeds.stream()
                .map(s -> projectRepository.save(new Project(
                        UUID.randomUUID(), demo, s.name, s.description,
                        s.status, s.priority, s.color, null, s.dueDate)))
                .toList();

        var jobHunt = projects.get(0);
        var weekDaysImprovements = projects.get(1);
        var personalLearning = projects.get(2);

        // ═══════════════════════════════════════════════════
        // TASKS
        // ═══════════════════════════════════════════════════

        record TaskSeed(String title, String description, TaskStatus status, TaskPriority priority,
                        LocalDate dueDate, double estimatedHours, Project project) {}

        List<TaskSeed> taskSeeds = List.of(
                // ── Job Hunt ────
                new TaskSeed("Update Resume",
                        "Revise resume with recent projects, skills, and experience. Tailor for target roles.",
                        TaskStatus.done, TaskPriority.high, now.minusDays(2), 3, jobHunt),
                new TaskSeed("Apply to 10 Companies",
                        "Find and apply to 10 relevant positions across different companies and platforms.",
                        TaskStatus.in_progress, TaskPriority.high, now.plusDays(7), 10, jobHunt),
                new TaskSeed("Practice DSA",
                        "Solve LeetCode problems focusing on arrays, strings, and dynamic programming.",
                        TaskStatus.done, TaskPriority.medium, now.minusDays(5), 8, jobHunt),
                new TaskSeed("Prepare HR Interview",
                        "Research common HR interview questions and prepare STAR-format responses.",
                        TaskStatus.todo, TaskPriority.medium, now.plusDays(10), 4, jobHunt),
                new TaskSeed("Revise Java Collections",
                        "Review Java Collections Framework: List, Set, Map, Queue implementations and complexity.",
                        TaskStatus.done, TaskPriority.low, now.minusDays(7), 3, jobHunt),
                new TaskSeed("Study Spring Security",
                        "Deep dive into Spring Security architecture, JWT filters, and method-level security.",
                        TaskStatus.in_progress, TaskPriority.high, now.plusDays(5), 6, jobHunt),
                new TaskSeed("Mock Interview",
                        "Schedule and complete a mock technical interview with a peer or coach.",
                        TaskStatus.todo, TaskPriority.medium, now.plusDays(14), 2, jobHunt),

                // ── WeekDays Improvements ────
                new TaskSeed("Add Dark Mode",
                        "Implement theme switching between dark and light mode using CSS variables and local storage.",
                        TaskStatus.done, TaskPriority.medium, now.minusDays(3), 6, weekDaysImprovements),
                new TaskSeed("Implement Drag & Drop Tasks",
                        "Add HTML5 drag-and-drop support for reordering tasks and changing status on Kanban board.",
                        TaskStatus.todo, TaskPriority.high, now.plusDays(21), 12, weekDaysImprovements),
                new TaskSeed("Improve Dashboard Charts",
                        "Enhance analytics charts with animations, tooltips, and interactive filtering.",
                        TaskStatus.in_progress, TaskPriority.medium, now.plusDays(14), 8, weekDaysImprovements),
                new TaskSeed("Add Email Notifications",
                        "Integrate email service to send notifications for task assignments and calendar reminders.",
                        TaskStatus.todo, TaskPriority.low, now.plusDays(30), 10, weekDaysImprovements),
                new TaskSeed("Mobile UI Improvements",
                        "Optimize layouts, touch targets, and navigation for mobile and tablet screens.",
                        TaskStatus.todo, TaskPriority.medium, now.plusDays(28), 8, weekDaysImprovements),

                // ── Personal Learning ────
                new TaskSeed("Complete Spring Boot Course",
                        "Finish the Spring Boot 3 masterclass covering JPA, Security, Actuator, and testing.",
                        TaskStatus.done, TaskPriority.high, now.minusDays(1), 20, personalLearning),
                new TaskSeed("Learn Docker Basics",
                        "Understand Docker concepts: images, containers, volumes, networks, and Docker Compose.",
                        TaskStatus.in_progress, TaskPriority.medium, now.plusDays(10), 6, personalLearning),
                new TaskSeed("Study System Design",
                        "Learn distributed system design patterns: load balancing, caching, database sharding, microservices.",
                        TaskStatus.done, TaskPriority.high, now.minusDays(4), 12, personalLearning)
        );

        for (var s : taskSeeds) {
            Task task = new Task(
                    UUID.randomUUID(), demo, s.project(),
                    s.title(), s.description(),
                    s.status(), s.priority(), s.dueDate(),
                    demo.getId(), "Demo User", s.estimatedHours(),
                    "[]", "[]", "[]");
            // Set spent hours for completed tasks
            if (s.status() == TaskStatus.done) {
                task.setSpentHours(s.estimatedHours());
            }
            // Set a realistic position
            task.setPosition(taskSeeds.indexOf(s));
            taskRepository.save(task);
        }

        // ═══════════════════════════════════════════════════
        // CALENDAR EVENTS
        // ═══════════════════════════════════════════════════

        var tomorrow = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);
        // Find this Friday
        var friday = LocalDateTime.now().plusDays((5 - LocalDateTime.now().getDayOfWeek().getValue() + 7) % 7)
                .withHour(18).withMinute(0);
        // Find next Monday
        var nextMonday = LocalDateTime.now().plusDays((1 - LocalDateTime.now().getDayOfWeek().getValue() + 7) % 7)
                .plusDays(7).withHour(10).withMinute(0);
        // This weekend (Saturday 9 AM)
        var weekend = LocalDateTime.now().plusDays((6 - LocalDateTime.now().getDayOfWeek().getValue() + 7) % 7)
                .withHour(9).withMinute(0);

        calendarRepository.save(new CalendarEvent(
                UUID.randomUUID(), demo, null, null,
                "Technical Interview", "Technical interview with the engineering team. Topics: DSA, System Design, and Spring Boot.",
                CalendarEventType.meeting,
                tomorrow, tomorrow.plusHours(1), false, "blue", "Google Meet"));
        calendarRepository.save(new CalendarEvent(
                UUID.randomUUID(), demo, jobHunt, null,
                "Resume Review", "Review and refine resume with a career coach. Focus on impact metrics and keyword optimization.",
                CalendarEventType.meeting,
                friday, friday.plusHours(1), false, "blue", "Zoom"));
        calendarRepository.save(new CalendarEvent(
                UUID.randomUUID(), demo, weekDaysImprovements, null,
                "Project Demo", "Demonstrate WeekDays features to stakeholders. Walk through projects, tasks, and analytics.",
                CalendarEventType.meeting,
                nextMonday, nextMonday.plusHours(1), false, "purple", "Conference Room A"));
        calendarRepository.save(new CalendarEvent(
                UUID.randomUUID(), demo, personalLearning, null,
                "Complete Spring Boot Module", "Finish the remaining sections of the Spring Boot course including testing and deployment.",
                CalendarEventType.milestone,
                weekend, weekend.plusHours(3), false, "green", ""));

        // ═══════════════════════════════════════════════════
        // NOTIFICATIONS
        // ═══════════════════════════════════════════════════

        var notif1 = notificationRepository.save(new Notification(
                UUID.randomUUID(), demo,
                "Welcome to WeekDays!",
                "Your workspace is ready. Start by exploring your projects and tasks.",
                "info", "/dashboard"));

        var notif2 = notificationRepository.save(new Notification(
                UUID.randomUUID(), demo,
                "Task Completed",
                "Task \"Practice DSA\" has been marked as completed. Great progress!",
                "success", "/tasks"));

        var notif3 = notificationRepository.save(new Notification(
                UUID.randomUUID(), demo,
                "Interview Tomorrow",
                "You have a Technical Interview scheduled for tomorrow at 10:00 AM.",
                "info", "/calendar"));

        var notif4 = notificationRepository.save(new Notification(
                UUID.randomUUID(), demo,
                "New Project Created",
                "Project \"Personal Learning\" has been created successfully.",
                "info", "/projects"));

        var notif5 = notificationRepository.save(new Notification(
                UUID.randomUUID(), demo,
                "Weekly Summary Available",
                "You completed 6 tasks this week. Check your dashboard for detailed insights.",
                "info", "/analytics"));

        // Mark some as read
        notif2.setRead(true);
        notif4.setRead(true);
        notificationRepository.save(notif2);
        notificationRepository.save(notif4);

        log.info("Demo workspace seeded: 3 projects, 15 tasks, 4 events, 5 notifications.");
    }


}
