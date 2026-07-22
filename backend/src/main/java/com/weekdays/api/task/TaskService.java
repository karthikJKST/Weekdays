package com.weekdays.api.task;

import com.weekdays.api.project.Project;
import com.weekdays.api.project.ProjectRepository;
import com.weekdays.api.user.User;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TaskService {

    private final TaskRepository repository;
    private final ProjectRepository projectRepository;
    private final TaskMapper mapper;

    public TaskService(TaskRepository repository, ProjectRepository projectRepository, TaskMapper mapper) {
        this.repository = repository;
        this.projectRepository = projectRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasks(UUID ownerId, String projectId, boolean includeArchived) {
        List<Task> tasks;
        if (projectId != null && !projectId.isBlank()) {
            UUID projectUuid = UUID.fromString(projectId);
            tasks = includeArchived
                    ? repository.findAllByOwnerIdAndProjectIdOrderByUpdatedAtDesc(ownerId, projectUuid)
                    : repository.findAllByOwnerIdAndProjectIdAndArchivedFalseOrderByUpdatedAtDesc(ownerId, projectUuid);
        } else {
            tasks = includeArchived
                    ? repository.findAllByOwnerIdOrderByUpdatedAtDesc(ownerId)
                    : repository.findAllByOwnerIdAndArchivedFalseOrderByUpdatedAtDesc(ownerId);
        }
        return tasks.stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getTask(UUID id, UUID ownerId) {
        return mapper.toResponse(findTask(id, ownerId));
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getTodaysTasks(UUID ownerId) {
        return repository.findAllByOwnerIdAndDueDateAndArchivedFalse(ownerId, LocalDate.now())
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getUpcomingTasks(UUID ownerId) {
        return repository.findUpcomingByOwnerId(ownerId, LocalDate.now())
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getOverdueTasks(UUID ownerId) {
        return repository.findAllByOwnerIdAndDueDateBeforeAndArchivedFalse(ownerId, LocalDate.now())
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getCompletedTasks(UUID ownerId) {
        return repository.findAllByOwnerIdAndStatusAndArchivedFalseOrderByUpdatedAtDesc(ownerId, TaskStatus.done)
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getArchivedTasks(UUID ownerId) {
        return repository.findAllByOwnerIdAndArchivedTrueOrderByUpdatedAtDesc(ownerId)
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> searchTasks(UUID ownerId, String query) {
        return repository.searchByOwnerId(ownerId, query)
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional
    public TaskResponse createTask(CreateTaskRequest request, User owner) {
        UUID projectId = UUID.fromString(request.projectId());
        Project project = projectRepository.findByIdAndOwnerId(projectId, owner.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found."));

        // Get next position
        List<Task> existing = repository.findAllByOwnerIdAndProjectIdAndArchivedFalseOrderByUpdatedAtDesc(owner.getId(), projectId);
        int nextPosition = existing.isEmpty() ? 0 : existing.stream().mapToInt(Task::getPosition).max().orElse(0) + 1;

        Task task = new Task(
                UUID.randomUUID(),
                owner,
                project,
                request.title().trim(),
                request.description(),
                request.status(),
                request.priority(),
                request.dueDate(),
                null,
                request.assigneeName() != null ? request.assigneeName().trim() : null,
                request.estimatedHours(),
                mapper.toLabelsString(request.labels()),
                "[]",
                "[]"
        );
        task.setPosition(nextPosition);
        task = repository.save(task);
        return mapper.toResponse(task);
    }

    @Transactional
    public TaskResponse updateTask(UUID id, UpdateTaskRequest request, UUID ownerId) {
        Task task = findTask(id, ownerId);

        UUID newProjectId = UUID.fromString(request.projectId());
        if (!task.getProject().getId().equals(newProjectId)) {
            Project project = projectRepository.findByIdAndOwnerId(newProjectId, ownerId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found."));
            task.setProject(project);
        }

        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setStatus(request.status());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
        task.setAssigneeName(request.assigneeName() != null ? request.assigneeName().trim() : null);
        task.setEstimatedHours(request.estimatedHours());
        task.setSpentHours(request.spentHours());
        task.setLabels(mapper.toLabelsString(request.labels()));
        task.preUpdate();
        task = repository.save(task);
        return mapper.toResponse(task);
    }

    @Transactional
    public TaskResponse updateTaskStatus(UUID id, TaskStatus status, UUID ownerId) {
        Task task = findTask(id, ownerId);
        task.setStatus(status);
        task.preUpdate();
        task = repository.save(task);
        return mapper.toResponse(task);
    }

    @Transactional
    public TaskResponse updateTaskPriority(UUID id, TaskPriority priority, UUID ownerId) {
        Task task = findTask(id, ownerId);
        task.setPriority(priority);
        task.preUpdate();
        task = repository.save(task);
        return mapper.toResponse(task);
    }

    @Transactional
    public TaskResponse updateTaskDueDate(UUID id, LocalDate dueDate, UUID ownerId) {
        Task task = findTask(id, ownerId);
        task.setDueDate(dueDate);
        task.preUpdate();
        task = repository.save(task);
        return mapper.toResponse(task);
    }

    @Transactional
    public TaskResponse assignTask(UUID id, AssignTaskRequest request, UUID ownerId) {
        Task task = findTask(id, ownerId);
        task.setAssigneeName(request.assigneeName());
        if (request.assigneeId() != null && !request.assigneeId().isBlank()) {
            task.setAssigneeId(UUID.fromString(request.assigneeId()));
        }
        task.preUpdate();
        task = repository.save(task);
        return mapper.toResponse(task);
    }

    @Transactional
    public TaskResponse unassignTask(UUID id, UUID ownerId) {
        Task task = findTask(id, ownerId);
        task.setAssigneeName(null);
        task.setAssigneeId(null);
        task.preUpdate();
        task = repository.save(task);
        return mapper.toResponse(task);
    }

    @Transactional
    public TaskResponse updateTaskPosition(UUID id, int position, UUID ownerId) {
        Task task = findTask(id, ownerId);
        task.setPosition(position);
        task.preUpdate();
        task = repository.save(task);
        return mapper.toResponse(task);
    }

    @Transactional
    public void deleteTask(UUID id, UUID ownerId) {
        Task task = findTask(id, ownerId);
        repository.delete(task);
    }

    @Transactional
    public TaskResponse archiveTask(UUID id, UUID ownerId) {
        Task task = findTask(id, ownerId);
        task.setArchived(true);
        task.setArchivedAt(Instant.now());
        task.preUpdate();
        task = repository.save(task);
        return mapper.toResponse(task);
    }

    @Transactional
    public TaskResponse restoreTask(UUID id, UUID ownerId) {
        Task task = findTask(id, ownerId);
        task.setArchived(false);
        task.setArchivedAt(null);
        task.preUpdate();
        task = repository.save(task);
        return mapper.toResponse(task);
    }

    @Transactional
    public void bulkUpdateStatus(List<String> ids, TaskStatus status, UUID ownerId) {
        List<UUID> uuids = ids.stream().map(UUID::fromString).toList();
        List<Task> tasks = repository.findAllByIdInAndOwnerId(uuids, ownerId);
        for (Task task : tasks) {
            task.setStatus(status);
        }
        repository.saveAll(tasks);
    }

    @Transactional
    public void bulkUpdatePriority(List<String> ids, TaskPriority priority, UUID ownerId) {
        List<UUID> uuids = ids.stream().map(UUID::fromString).toList();
        List<Task> tasks = repository.findAllByIdInAndOwnerId(uuids, ownerId);
        for (Task task : tasks) {
            task.setPriority(priority);
        }
        repository.saveAll(tasks);
    }

    @Transactional
    public void bulkDelete(List<String> ids, UUID ownerId) {
        List<UUID> uuids = ids.stream().map(UUID::fromString).toList();
        List<Task> tasks = repository.findAllByIdInAndOwnerId(uuids, ownerId);
        repository.deleteAll(tasks);
    }

    @Transactional
    public void bulkArchive(List<String> ids, UUID ownerId) {
        List<UUID> uuids = ids.stream().map(UUID::fromString).toList();
        List<Task> tasks = repository.findAllByIdInAndOwnerId(uuids, ownerId);
        Instant now = Instant.now();
        for (Task task : tasks) {
            task.setArchived(true);
            task.setArchivedAt(now);
        }
        repository.saveAll(tasks);
    }

    @Transactional
    public void bulkRestore(List<String> ids, UUID ownerId) {
        List<UUID> uuids = ids.stream().map(UUID::fromString).toList();
        List<Task> tasks = repository.findAllByIdInAndOwnerId(uuids, ownerId);
        for (Task task : tasks) {
            task.setArchived(false);
            task.setArchivedAt(null);
        }
        repository.saveAll(tasks);
    }

    private Task findTask(UUID id, UUID ownerId) {
        return repository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found."));
    }
}
