package com.weekdays.api.task;

import com.weekdays.api.auth.UserDetailsImpl;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // ── List / Search ────────────────────────────────

    @GetMapping
    public List<TaskResponse> getAllTasks(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @RequestParam(required = false) String projectId,
            @RequestParam(defaultValue = "false") boolean includeArchived) {
        return taskService.getAllTasks(principal.getUser().getId(), projectId, includeArchived);
    }

    @GetMapping("/today")
    public List<TaskResponse> getTodaysTasks(
            @AuthenticationPrincipal UserDetailsImpl principal) {
        return taskService.getTodaysTasks(principal.getUser().getId());
    }

    @GetMapping("/upcoming")
    public List<TaskResponse> getUpcomingTasks(
            @AuthenticationPrincipal UserDetailsImpl principal) {
        return taskService.getUpcomingTasks(principal.getUser().getId());
    }

    @GetMapping("/overdue")
    public List<TaskResponse> getOverdueTasks(
            @AuthenticationPrincipal UserDetailsImpl principal) {
        return taskService.getOverdueTasks(principal.getUser().getId());
    }

    @GetMapping("/completed")
    public List<TaskResponse> getCompletedTasks(
            @AuthenticationPrincipal UserDetailsImpl principal) {
        return taskService.getCompletedTasks(principal.getUser().getId());
    }

    @GetMapping("/archived")
    public List<TaskResponse> getArchivedTasks(
            @AuthenticationPrincipal UserDetailsImpl principal) {
        return taskService.getArchivedTasks(principal.getUser().getId());
    }

    @GetMapping("/search")
    public List<TaskResponse> searchTasks(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @RequestParam String q) {
        return taskService.searchTasks(principal.getUser().getId(), q);
    }

    // ── Single task ──────────────────────────────────

    @GetMapping("/{id}")
    public TaskResponse getTask(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable UUID id) {
        return taskService.getTask(id, principal.getUser().getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse createTask(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @Valid @RequestBody CreateTaskRequest request) {
        return taskService.createTask(request, principal.getUser());
    }

    @PutMapping("/{id}")
    public TaskResponse updateTask(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTaskRequest request) {
        return taskService.updateTask(id, request, principal.getUser().getId());
    }

    // ── Patch endpoints ──────────────────────────────

    @PatchMapping("/{id}/status")
    public TaskResponse updateTaskStatus(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable UUID id,
            @Valid @RequestBody TaskStatusUpdateRequest request) {
        return taskService.updateTaskStatus(id, request.status(), principal.getUser().getId());
    }

    @PatchMapping("/{id}/priority")
    public TaskResponse updateTaskPriority(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable UUID id,
            @Valid @RequestBody TaskPriorityUpdateRequest request) {
        return taskService.updateTaskPriority(id, request.priority(), principal.getUser().getId());
    }

    @PatchMapping("/{id}/due-date")
    public TaskResponse updateTaskDueDate(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate) {
        return taskService.updateTaskDueDate(id, dueDate, principal.getUser().getId());
    }

    @PatchMapping("/{id}/assign")
    public TaskResponse assignTask(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable UUID id,
            @Valid @RequestBody AssignTaskRequest request) {
        return taskService.assignTask(id, request, principal.getUser().getId());
    }

    @PatchMapping("/{id}/unassign")
    public TaskResponse unassignTask(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable UUID id) {
        return taskService.unassignTask(id, principal.getUser().getId());
    }

    @PatchMapping("/{id}/position")
    public TaskResponse updateTaskPosition(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable UUID id,
            @RequestParam int position) {
        return taskService.updateTaskPosition(id, position, principal.getUser().getId());
    }

    @PatchMapping("/{id}/archive")
    public TaskResponse archiveTask(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable UUID id) {
        return taskService.archiveTask(id, principal.getUser().getId());
    }

    @PatchMapping("/{id}/restore")
    public TaskResponse restoreTask(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable UUID id) {
        return taskService.restoreTask(id, principal.getUser().getId());
    }

    // ── Delete ───────────────────────────────────────

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable UUID id) {
        taskService.deleteTask(id, principal.getUser().getId());
    }

    // ── Bulk operations ──────────────────────────────

    @PatchMapping("/bulk/status")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void bulkUpdateStatus(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @Valid @RequestBody BulkStatusUpdateRequest request) {
        taskService.bulkUpdateStatus(request.ids(), request.status(), principal.getUser().getId());
    }

    @PatchMapping("/bulk/priority")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void bulkUpdatePriority(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @Valid @RequestBody BulkPriorityUpdateRequest request) {
        taskService.bulkUpdatePriority(request.ids(), request.priority(), principal.getUser().getId());
    }

    @PatchMapping("/bulk/archive")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void bulkArchive(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @Valid @RequestBody BulkDeleteRequest request) {
        taskService.bulkArchive(request.ids(), principal.getUser().getId());
    }

    @PatchMapping("/bulk/restore")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void bulkRestore(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @Valid @RequestBody BulkDeleteRequest request) {
        taskService.bulkRestore(request.ids(), principal.getUser().getId());
    }

    @DeleteMapping("/bulk")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void bulkDelete(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @Valid @RequestBody BulkDeleteRequest request) {
        taskService.bulkDelete(request.ids(), principal.getUser().getId());
    }
}
