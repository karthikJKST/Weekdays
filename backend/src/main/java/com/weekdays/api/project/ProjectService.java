package com.weekdays.api.project;

import com.weekdays.api.user.User;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProjectService {

    private final ProjectRepository repository;
    private final ProjectMapper mapper;

    public ProjectService(ProjectRepository repository, ProjectMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<ProjectResponse> getAllProjects(UUID ownerId, boolean includeArchived) {
        List<Project> projects = includeArchived
                ? repository.findAllByOwnerIdOrderByUpdatedAtDesc(ownerId)
                : repository.findAllByOwnerIdAndArchivedFalseOrderByUpdatedAtDesc(ownerId);
        return projects.stream().map(mapper::toResponse).toList();
    }

    public ProjectResponse getProject(UUID id, UUID ownerId) {
        Project project = findProject(id, ownerId);
        return mapper.toResponse(project);
    }

    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request, User owner) {
        Project project = new Project(
                UUID.randomUUID(),
                owner,
                request.name().trim(),
                request.description().trim(),
                request.status(),
                request.priority(),
                request.color(),
                null,
                request.dueDate()
        );
        project = repository.save(project);
        return mapper.toResponse(project);
    }

    @Transactional
    public ProjectResponse updateProject(UUID id, UpdateProjectRequest request, UUID ownerId) {
        Project project = findProject(id, ownerId);
        project.setName(request.name().trim());
        project.setDescription(request.description().trim());
        project.setStatus(request.status());
        project.setPriority(request.priority());
        project.setColor(request.color());
        project.setDueDate(request.dueDate());
        project.preUpdate();
        project = repository.save(project);
        return mapper.toResponse(project);
    }

    @Transactional
    public ProjectResponse updateProjectStatus(UUID id, ProjectStatus status, UUID ownerId) {
        Project project = findProject(id, ownerId);
        project.setStatus(status);
        project.preUpdate();
        project = repository.save(project);
        return mapper.toResponse(project);
    }

    @Transactional
    public void deleteProject(UUID id, UUID ownerId) {
        Project project = findProject(id, ownerId);
        repository.delete(project);
    }

    @Transactional
    public ProjectResponse archiveProject(UUID id, UUID ownerId) {
        Project project = findProject(id, ownerId);
        project.setArchived(true);
        project.preUpdate();
        project = repository.save(project);
        return mapper.toResponse(project);
    }

    private Project findProject(UUID id, UUID ownerId) {
        return repository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found."));
    }
}
