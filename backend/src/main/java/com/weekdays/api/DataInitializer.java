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
import com.weekdays.api.user.UserRole;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final CalendarRepository calendarRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           ProjectRepository projectRepository,
                           TaskRepository taskRepository,
                           CalendarRepository calendarRepository,
                           NotificationRepository notificationRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.calendarRepository = calendarRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByEmailIgnoreCase("demo@weekdays.dev").isPresent()) {
            log.info("Demo data already exists — skipping seed.");
            return;
        }

        log.info("Seeding demo data...");

        // ── Demo user ────────────────────────────────────
        User demo = new User(UUID.randomUUID(), "Demo User", "demo@weekdays.dev",
                passwordEncoder.encode("Demo@123"), UserRole.OWNER);
        demo = userRepository.save(demo);

        // ── Projects ─────────────────────────────────────
        record ProjectSeed(String name, String desc, ProjectStatus status, ProjectPriority priority, String color, LocalDate due) {}
        List<ProjectSeed> projectSeeds = List.of(
                new ProjectSeed("WeekDays Platform", "The engineering execution platform you're currently using. Tracks projects, tasks, and team velocity across the entire development lifecycle.",
                        ProjectStatus.in_progress, ProjectPriority.critical, "indigo", LocalDate.of(2026, 9, 15)),
                new ProjectSeed("AI Interview Assistant", "An AI-powered interview preparation tool that analyzes resumes, generates custom questions, and provides real-time feedback during mock interviews.",
                        ProjectStatus.in_progress, ProjectPriority.high, "violet", LocalDate.of(2026, 8, 30)),
                new ProjectSeed("Portfolio Website", "Personal portfolio showcasing projects, skills, and experience. Built with React and deployed on Vercel with custom domain.",
                        ProjectStatus.done, ProjectPriority.medium, "emerald", LocalDate.of(2026, 6, 15)),
                new ProjectSeed("DevFlow CLI", "A developer workflow automation tool that streamlines git operations, code reviews, and CI/CD pipeline management from the terminal.",
                        ProjectStatus.in_progress, ProjectPriority.high, "cyan", LocalDate.of(2026, 8, 1)),
                new ProjectSeed("StackFlow", "A real-time stock market visualization platform with interactive charts, portfolio tracking, and configurable price alerts.",
                        ProjectStatus.done, ProjectPriority.medium, "amber", LocalDate.of(2026, 5, 30)),
                new ProjectSeed("Company Careers Portal", "A modern careers portal with job listings, application tracking, and an AI-powered candidate matching system.",
                        ProjectStatus.in_progress, ProjectPriority.medium, "rose", LocalDate.of(2026, 10, 1)),
                new ProjectSeed("Internal CRM System", "A lightweight customer relationship management system for tracking leads, managing deals, and forecasting sales pipeline.",
                        ProjectStatus.backlog, ProjectPriority.low, "slate", LocalDate.of(2026, 11, 15))
        );

        List<Instant> projectCreatedAts = List.of(
                Instant.now().minus(45, ChronoUnit.DAYS),
                Instant.now().minus(30, ChronoUnit.DAYS),
                Instant.now().minus(90, ChronoUnit.DAYS),
                Instant.now().minus(20, ChronoUnit.DAYS),
                Instant.now().minus(120, ChronoUnit.DAYS),
                Instant.now().minus(15, ChronoUnit.DAYS),
                Instant.now().minus(5, ChronoUnit.DAYS)
        );

        List<Project> projects = new java.util.ArrayList<>();
        for (int i = 0; i < projectSeeds.size(); i++) {
            var s = projectSeeds.get(i);
            Project p = new Project(UUID.randomUUID(), demo, s.name, s.desc, s.status, s.priority, s.color, null, s.due);
            p.setArchived(false);
            projects.add(projectRepository.save(p));
        }

        // ── Tasks ────────────────────────────────────────
        record TaskSeed(String title, String desc, TaskStatus status, TaskPriority priority, int projIdx,
                        LocalDate due, String assignee, double est, double spent) {}
        List<TaskSeed> taskSeeds = List.of(
                // WeekDays Platform (index 0)
                new TaskSeed("Design authentication flow", "Design the complete authentication flow including login, registration, password reset, and OAuth integration. Create wireframes and user journey maps.",
                        TaskStatus.done, TaskPriority.urgent, 0, LocalDate.of(2026, 6, 10), "Alice", 16, 14),
                new TaskSeed("Implement JWT auth backend", "Implement JWT-based authentication with access and refresh token rotation. Include BCrypt password hashing and token revocation.",
                        TaskStatus.done, TaskPriority.urgent, 0, LocalDate.of(2026, 6, 15), "Bob", 24, 22),
                new TaskSeed("Build React auth UI", "Build the login and registration forms with React Hook Form validation, error handling, and persistent sessions.",
                        TaskStatus.done, TaskPriority.high, 0, LocalDate.of(2026, 6, 20), "Alice", 16, 18),
                new TaskSeed("Create project management module", "Build the full CRUD project management module with Kanban board, grid view, list view, and drag-and-drop status updates.",
                        TaskStatus.done, TaskPriority.urgent, 0, LocalDate.of(2026, 7, 1), "Charlie", 40, 38),
                new TaskSeed("Build task management system", "Implement the complete task management system with bulk operations, filtering, sorting, search, and multiple view modes.",
                        TaskStatus.done, TaskPriority.urgent, 0, LocalDate.of(2026, 7, 10), "Alice", 48, 45),
                new TaskSeed("Implement calendar views", "Build month, week, day, and agenda calendar views with drag-and-drop event rescheduling and mini calendar navigation.",
                        TaskStatus.done, TaskPriority.high, 0, LocalDate.of(2026, 7, 15), "Diana", 32, 30),
                new TaskSeed("Add analytics dashboard", "Create the analytics dashboard with real-time metrics, status/priority distribution charts, project health monitoring, and team workload analysis.",
                        TaskStatus.in_progress, TaskPriority.high, 0, LocalDate.of(2026, 7, 28), "Charlie", 24, 14),
                new TaskSeed("Optimize database queries", "Profile and optimize slow database queries. Add appropriate indexes and query tuning for the analytics and timeline endpoints.",
                        TaskStatus.todo, TaskPriority.medium, 0, LocalDate.of(2026, 8, 5), "Bob", 12, 0),
                new TaskSeed("Add WebSocket real-time updates", "Implement WebSocket-based real-time updates for collaborative task editing and live Kanban board changes.",
                        TaskStatus.todo, TaskPriority.medium, 0, LocalDate.of(2026, 8, 12), "Diana", 20, 0),
                new TaskSeed("Write integration tests", "Write comprehensive integration tests covering all API endpoints, authentication flows, and edge cases.",
                        TaskStatus.in_progress, TaskPriority.medium, 0, LocalDate.of(2026, 8, 10), "Bob", 16, 6),
                new TaskSeed("Dockerize the application", "Create Dockerfiles and Docker Compose configuration for running the full stack locally with PostgreSQL and Nginx.",
                        TaskStatus.done, TaskPriority.medium, 0, LocalDate.of(2026, 7, 5), "Charlie", 8, 8),
                new TaskSeed("Set up CI/CD pipeline", "Configure GitHub Actions for automated testing, linting, and deployment to staging and production environments.",
                        TaskStatus.in_progress, TaskPriority.high, 0, LocalDate.of(2026, 7, 25), "Diana", 12, 8),

                // AI Interview Assistant (index 1)
                new TaskSeed("Research AI models for interview prep", "Research and compare LLM providers for generating interview questions based on resumes and job descriptions.",
                        TaskStatus.done, TaskPriority.urgent, 1, LocalDate.of(2026, 7, 1), "Alice", 20, 18),
                new TaskSeed("Build resume parsing engine", "Build a resume parsing engine that extracts skills, experience, education, and projects from uploaded PDF and DOCX files.",
                        TaskStatus.in_progress, TaskPriority.high, 1, LocalDate.of(2026, 7, 25), "Bob", 24, 16),
                new TaskSeed("Implement question generation", "Implement the core question generation algorithm that creates personalized interview questions based on resume analysis.",
                        TaskStatus.todo, TaskPriority.high, 1, LocalDate.of(2026, 8, 5), "Charlie", 32, 0),
                new TaskSeed("Build real-time feedback system", "Build a real-time feedback system that evaluates user responses during mock interviews and provides constructive suggestions.",
                        TaskStatus.todo, TaskPriority.medium, 1, LocalDate.of(2026, 8, 20), "Diana", 28, 0),
                new TaskSeed("Design results dashboard", "Design a comprehensive results dashboard showing performance trends, skill gaps, and improvement recommendations.",
                        TaskStatus.todo, TaskPriority.medium, 1, LocalDate.of(2026, 9, 1), "Alice", 12, 0),
                new TaskSeed("Implement interview scheduling", "Implement interview scheduling with calendar integration, reminders, and video call links.",
                        TaskStatus.todo, TaskPriority.low, 1, LocalDate.of(2026, 9, 15), "Bob", 16, 0),

                // Portfolio Website (index 2 — done)
                new TaskSeed("Design landing page", "Design and implement the landing page with hero section, project showcase, skills overview, and contact form.",
                        TaskStatus.done, TaskPriority.urgent, 2, LocalDate.of(2026, 4, 1), "Alice", 12, 12),
                new TaskSeed("Build project showcase component", "Build a dynamic project showcase component with filtering, animations, and detailed project modal views.",
                        TaskStatus.done, TaskPriority.high, 2, LocalDate.of(2026, 4, 10), "Alice", 16, 14),
                new TaskSeed("Implement dark/light theme", "Implement a theme switcher with persistent dark/light mode using CSS variables and local storage.",
                        TaskStatus.done, TaskPriority.medium, 2, LocalDate.of(2026, 4, 15), "Alice", 8, 8),
                new TaskSeed("Add contact form with backend", "Add a functional contact form connected to a serverless backend for handling form submissions.",
                        TaskStatus.done, TaskPriority.medium, 2, LocalDate.of(2026, 4, 20), "Bob", 10, 10),
                new TaskSeed("Set up custom domain", "Configure custom domain with SSL, set up Vercel deployment, and configure DNS records.",
                        TaskStatus.done, TaskPriority.high, 2, LocalDate.of(2026, 5, 1), "Alice", 4, 4),
                new TaskSeed("Optimize SEO and performance", "Implement SEO best practices, meta tags, sitemap, and performance optimization with Lighthouse score targets.",
                        TaskStatus.done, TaskPriority.medium, 2, LocalDate.of(2026, 5, 10), "Alice", 8, 6),

                // DevFlow CLI (index 3)
                new TaskSeed("Design CLI architecture", "Design the CLI architecture with command tree, plugin system, and configuration management.",
                        TaskStatus.done, TaskPriority.urgent, 3, LocalDate.of(2026, 7, 1), "Charlie", 12, 10),
                new TaskSeed("Implement git automation commands", "Implement core git automation commands for branch management, commit formatting, and merge conflict resolution.",
                        TaskStatus.in_progress, TaskPriority.high, 3, LocalDate.of(2026, 7, 20), "Charlie", 20, 14),
                new TaskSeed("Build code review integration", "Build integration with GitHub and GitLab APIs for automated code review requests, comments, and approval tracking.",
                        TaskStatus.todo, TaskPriority.high, 3, LocalDate.of(2026, 8, 5), "Diana", 24, 0),
                new TaskSeed("Add CI/CD pipeline integration", "Add integration with common CI/CD platforms for triggering pipelines, viewing build status, and managing deployments.",
                        TaskStatus.todo, TaskPriority.medium, 3, LocalDate.of(2026, 8, 20), "Charlie", 20, 0),
                new TaskSeed("Write CLI tests and documentation", "Write comprehensive unit tests and end-user documentation with examples for all CLI commands.",
                        TaskStatus.todo, TaskPriority.medium, 3, LocalDate.of(2026, 8, 25), "Bob", 16, 0),
                new TaskSeed("Package and distribute CLI", "Package the CLI for distribution via npm and Homebrew with automated release pipeline.",
                        TaskStatus.todo, TaskPriority.low, 3, LocalDate.of(2026, 9, 5), "Diana", 8, 0),

                // StackFlow (index 4 — done)
                new TaskSeed("Build real-time stock data pipeline", "Build a WebSocket-based pipeline for streaming real-time stock prices from multiple exchanges.",
                        TaskStatus.done, TaskPriority.urgent, 4, LocalDate.of(2026, 3, 1), "Bob", 20, 18),
                new TaskSeed("Implement interactive candlestick charts", "Implement interactive candlestick charts with zoom, pan, and technical indicator overlays.",
                        TaskStatus.done, TaskPriority.high, 4, LocalDate.of(2026, 3, 10), "Alice", 24, 22),
                new TaskSeed("Build portfolio tracking module", "Build a portfolio tracking module with performance metrics, asset allocation, and rebalancing suggestions.",
                        TaskStatus.done, TaskPriority.high, 4, LocalDate.of(2026, 3, 20), "Charlie", 20, 18),
                new TaskSeed("Implement price alert system", "Implement a configurable price alert system with push notifications and email notifications.",
                        TaskStatus.done, TaskPriority.medium, 4, LocalDate.of(2026, 4, 1), "Diana", 12, 12),
                new TaskSeed("Add technical indicators", "Add popular technical indicators (RSI, MACD, Moving Averages, Bollinger Bands) with customizable parameters.",
                        TaskStatus.done, TaskPriority.medium, 4, LocalDate.of(2026, 4, 10), "Bob", 16, 14),
                new TaskSeed("Write market analysis reports", "Implement automated market analysis report generation with insights and trend identification.",
                        TaskStatus.done, TaskPriority.low, 4, LocalDate.of(2026, 4, 20), "Alice", 8, 7),

                // Company Careers Portal (index 5)
                new TaskSeed("Design job listing pages", "Design and implement job listing pages with advanced filtering, search, and company culture information.",
                        TaskStatus.done, TaskPriority.high, 5, LocalDate.of(2026, 7, 10), "Diana", 12, 10),
                new TaskSeed("Build application tracking system", "Build a complete application tracking system with status management, candidate profiles, and communication history.",
                        TaskStatus.in_progress, TaskPriority.high, 5, LocalDate.of(2026, 7, 25), "Bob", 24, 12),
                new TaskSeed("Implement AI candidate matching", "Implement AI-powered candidate matching that scores applicants based on job requirements and cultural fit.",
                        TaskStatus.todo, TaskPriority.medium, 5, LocalDate.of(2026, 8, 10), "Charlie", 20, 0),
                new TaskSeed("Add interview scheduling", "Add interview scheduling with calendar integration, automated reminders, and feedback collection forms.",
                        TaskStatus.todo, TaskPriority.medium, 5, LocalDate.of(2026, 8, 20), "Diana", 16, 0),
                new TaskSeed("Build admin dashboard", "Build a comprehensive admin dashboard with hiring metrics, pipeline analytics, and team performance tracking.",
                        TaskStatus.todo, TaskPriority.medium, 5, LocalDate.of(2026, 9, 1), "Alice", 20, 0),
                new TaskSeed("Integrate with job boards", "Integrate with major job boards (LinkedIn, Indeed, Glassdoor) for automated job posting and candidate import.",
                        TaskStatus.todo, TaskPriority.low, 5, LocalDate.of(2026, 9, 15), "Bob", 12, 0),

                // Internal CRM System (index 6 — todo)
                new TaskSeed("Design data model", "Design the CRM data model covering contacts, companies, deals, activities, and pipeline stages.",
                        TaskStatus.todo, TaskPriority.high, 6, LocalDate.of(2026, 8, 1), "Charlie", 12, 0),
                new TaskSeed("Build lead management module", "Build the lead management module with lead capture, scoring, enrichment, and distribution.",
                        TaskStatus.todo, TaskPriority.high, 6, LocalDate.of(2026, 8, 15), "Diana", 20, 0),
                new TaskSeed("Implement deal pipeline", "Implement the deal pipeline with visual stages, drag-and-drop updates, and probability-based forecasting.",
                        TaskStatus.todo, TaskPriority.medium, 6, LocalDate.of(2026, 9, 1), "Alice", 24, 0),
                new TaskSeed("Add activity tracking", "Add activity tracking for calls, emails, meetings, and notes with timeline view and reporting.",
                        TaskStatus.todo, TaskPriority.medium, 6, LocalDate.of(2026, 9, 15), "Bob", 16, 0),
                new TaskSeed("Build sales forecasting", "Build sales forecasting with machine learning predictions, historical analysis, and pipeline coverage metrics.",
                        TaskStatus.todo, TaskPriority.medium, 6, LocalDate.of(2026, 10, 1), "Charlie", 20, 0),
                new TaskSeed("Export and reporting", "Implement data export, custom report builder, and scheduled report delivery via email.",
                        TaskStatus.todo, TaskPriority.low, 6, LocalDate.of(2026, 10, 15), "Diana", 12, 0)
        );

        for (var s : taskSeeds) {
            Task t = new Task(UUID.randomUUID(), demo, projects.get(s.projIdx),
                    s.title, s.desc, s.status, s.priority, s.due, null, s.assignee, s.est, "[]", "[]", "[]");
            t.setSpentHours(s.spent);
            taskRepository.save(t);
        }

        // ── Calendar Events ──────────────────────────────
        record EventSeed(String title, String desc, CalendarEventType type, int daysFromNow, int projIdx, String color) {}
        List<EventSeed> eventSeeds = List.of(
                new EventSeed("Sprint Planning", "Plan the upcoming sprint. Review backlog, estimate tasks, and assign team members to user stories.", CalendarEventType.meeting, 1, 0, "indigo"),
                new EventSeed("Daily Standup", "Daily team standup to discuss progress, blockers, and plans for the day.", CalendarEventType.meeting, 0, 0, "emerald"),
                new EventSeed("Client Demo — AI Interview", "Demonstrate the latest AI Interview Assistant features to the client. Show resume parsing and question generation.", CalendarEventType.meeting, 3, 1, "violet"),
                new EventSeed("Backend Code Review", "Team code review session focused on the analytics and timeline API endpoints.", CalendarEventType.meeting, 2, 0, "cyan"),
                new EventSeed("Frontend Review", "Review the new analytics dashboard UI components and charts implementation.", CalendarEventType.meeting, 4, 0, "indigo"),
                new EventSeed("Deployment v1.0.0", "Deploy the initial version of WeekDays to production. Monitor rollout and verify all services.", CalendarEventType.milestone, 5, 0, "amber"),
                new EventSeed("Team Standup", "Weekly team standup to align on priorities and discuss cross-team dependencies.", CalendarEventType.meeting, -1, 0, "emerald"),
                new EventSeed("Code Freeze", "Code freeze for the v1.1 release. Only critical bug fixes will be accepted.", CalendarEventType.milestone, 10, 3, "rose"),
                new EventSeed("Demo Day", "Present completed features and project progress to stakeholders and leadership.", CalendarEventType.meeting, 7, 0, "amber"),
                new EventSeed("Interview — Senior Frontend", "Technical interview with a senior frontend developer candidate. System design and React deep dive.", CalendarEventType.meeting, 6, 1, "violet"),
                new EventSeed("Sprint Retrospective", "Reflect on the completed sprint. Discuss what went well, what could improve, and action items.", CalendarEventType.meeting, 8, 0, "indigo"),
                new EventSeed("Release v1.1 Planning", "Plan the scope and timeline for the v1.1 release. Review feature requests and prioritize backlog.", CalendarEventType.meeting, 12, 0, "cyan")
        );

        for (var s : eventSeeds) {
            LocalDateTime start = LocalDateTime.now().plusDays(s.daysFromNow).withHour(10).withMinute(0);
            LocalDateTime end = start.plusHours(1);
            CalendarEvent event = new CalendarEvent(
                    UUID.randomUUID(), demo,
                    s.projIdx < projects.size() ? projects.get(s.projIdx) : null,
                    null,
                    s.title, s.desc, s.type, start, end, false, s.color, ""
            );
            calendarRepository.save(event);
        }

        // ── Notifications ─────────────────────────────
        record NotificationSeed(String title, String message, String type, String link) {}
        List<NotificationSeed> notificationSeeds = List.of(
                new NotificationSeed("Welcome to WeekDays", "Your account has been created. Start by creating your first project.", "info", "/projects"),
                new NotificationSeed("Tasks due soon", "You have 5 tasks due this week. Check your upcoming tasks.", "warning", "/tasks"),
                new NotificationSeed("Project completed", "The Portfolio Website project has been marked as complete. Great work!", "success", "/projects"),
                new NotificationSeed("Sprint planning tomorrow", "Don't forget the upcoming sprint planning session at 10:00 AM.", "info", "/calendar"),
                new NotificationSeed("New task assigned", "Alice assigned you to 'Optimize database queries'. Due Aug 5.", "info", "/tasks"),
                new NotificationSeed("Overdue tasks", "3 tasks are overdue. Review and update their status.", "warning", "/tasks"),
                new NotificationSeed("Calendar event updated", "The Code Freeze event has been rescheduled to next week.", "info", "/calendar"),
                new NotificationSeed("Analytics available", "Your project analytics are ready. Check the dashboard for insights.", "success", "/analytics")
        );

        for (var s : notificationSeeds) {
            Notification n = new Notification(UUID.randomUUID(), demo, s.title, s.message, s.type, s.link);
            notificationRepository.save(n);
        }

        log.info("Demo data seeded successfully. Email: demo@weekdays.dev / Password: Demo@123");
    }
}
