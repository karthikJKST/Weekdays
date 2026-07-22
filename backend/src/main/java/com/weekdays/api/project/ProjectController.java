package com.weekdays.api.project;

import com.weekdays.api.auth.UserDetailsImpl;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<ProjectResponse> getAllProjects(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @RequestParam(defaultValue = "false") boolean includeArchived) {
        return projectService.getAllProjects(principal.getUser().getId(), includeArchived);
    }

    @GetMapping("/{id}")
    public ProjectResponse getProject(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable UUID id) {
        return projectService.getProject(id, principal.getUser().getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectResponse createProject(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @Valid @RequestBody CreateProjectRequest request) {
        return projectService.createProject(request, principal.getUser());
    }

    @PutMapping("/{id}")
    public ProjectResponse updateProject(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProjectRequest request) {
        return projectService.updateProject(id, request, principal.getUser().getId());
    }

    @PatchMapping("/{id}/status")
    public ProjectResponse updateProjectStatus(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable UUID id,
            @Valid @RequestBody StatusUpdateRequest request) {
        return projectService.updateProjectStatus(id, request.status(), principal.getUser().getId());
    }

    @PatchMapping("/{id}")
    public ProjectResponse patchProject(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProjectRequest request) {
        return projectService.updateProject(id, request, principal.getUser().getId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProject(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable UUID id) {
        projectService.deleteProject(id, principal.getUser().getId());
    }

    @PatchMapping("/{id}/archive")
    public ProjectResponse archiveProject(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable UUID id) {
        return projectService.archiveProject(id, principal.getUser().getId());
    }
}
