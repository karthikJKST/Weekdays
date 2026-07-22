package com.weekdays.api.project;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.weekdays.api.user.User;
import com.weekdays.api.user.UserRole;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository repository;

    private ProjectMapper mapper;
    private ProjectService service;
    private User owner;
    private Project project;

    @BeforeEach
    void setUp() {
        mapper = new ProjectMapper();
        service = new ProjectService(repository, mapper);
        owner = new User(UUID.randomUUID(), "Test Owner", "owner@example.com", "hash", UserRole.OWNER);
        project = new Project(
                UUID.randomUUID(), owner, "Test Project", "Description",
                ProjectStatus.in_progress, ProjectPriority.high, "indigo",
                null, LocalDate.of(2026, 5, 1)
        );
    }

    @Test
    void shouldGetAllProjects() {
        when(repository.findAllByOwnerIdAndArchivedFalseOrderByUpdatedAtDesc(owner.getId()))
                .thenReturn(List.of(project));

        var result = service.getAllProjects(owner.getId(), false);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().name()).isEqualTo("Test Project");
        assertThat(result.getFirst().status()).isEqualTo(ProjectStatus.in_progress);
        assertThat(result.getFirst().priority()).isEqualTo(ProjectPriority.high);
        assertThat(result.getFirst().color()).isEqualTo("indigo");
        assertThat(result.getFirst().dueDate()).isEqualTo(LocalDate.of(2026, 5, 1));
    }

    @Test
    void shouldGetProjectById() {
        when(repository.findByIdAndOwnerId(project.getId(), owner.getId()))
                .thenReturn(Optional.of(project));

        var result = service.getProject(project.getId(), owner.getId());

        assertThat(result.id()).isEqualTo(project.getId());
        assertThat(result.name()).isEqualTo("Test Project");
    }

    @Test
    void shouldThrow404WhenProjectNotFound() {
        when(repository.findByIdAndOwnerId(any(), any()))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getProject(UUID.randomUUID(), owner.getId()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404 NOT_FOUND");
    }

    @Test
    void shouldCreateProject() {
        var request = new CreateProjectRequest("New Project", "A new project",
                ProjectStatus.backlog, ProjectPriority.medium, "indigo", LocalDate.of(2026, 6, 1));

        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        var result = service.createProject(request, owner);

        assertThat(result.name()).isEqualTo("New Project");
        assertThat(result.status()).isEqualTo(ProjectStatus.backlog);
        assertThat(result.priority()).isEqualTo(ProjectPriority.medium);
        assertThat(result.dueDate()).isEqualTo(LocalDate.of(2026, 6, 1));
        verify(repository).save(any());
    }

    @Test
    void shouldUpdateProject() {
        when(repository.findByIdAndOwnerId(project.getId(), owner.getId()))
                .thenReturn(Optional.of(project));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        var request = new UpdateProjectRequest("Updated Name", "Updated description",
                ProjectStatus.done, ProjectPriority.low, "emerald", LocalDate.of(2026, 7, 1));

        var result = service.updateProject(project.getId(), request, owner.getId());

        assertThat(result.name()).isEqualTo("Updated Name");
        assertThat(result.status()).isEqualTo(ProjectStatus.done);
        assertThat(result.priority()).isEqualTo(ProjectPriority.low);
        assertThat(result.color()).isEqualTo("emerald");
        assertThat(result.dueDate()).isEqualTo(LocalDate.of(2026, 7, 1));
    }

    @Test
    void shouldUpdateProjectStatus() {
        when(repository.findByIdAndOwnerId(project.getId(), owner.getId()))
                .thenReturn(Optional.of(project));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        var result = service.updateProjectStatus(project.getId(), ProjectStatus.done, owner.getId());

        assertThat(result.status()).isEqualTo(ProjectStatus.done);
    }

    @Test
    void shouldDeleteProject() {
        when(repository.findByIdAndOwnerId(project.getId(), owner.getId()))
                .thenReturn(Optional.of(project));

        service.deleteProject(project.getId(), owner.getId());

        verify(repository).delete(project);
    }

    @Test
    void shouldArchiveProject() {
        when(repository.findByIdAndOwnerId(project.getId(), owner.getId()))
                .thenReturn(Optional.of(project));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        var result = service.archiveProject(project.getId(), owner.getId());

        assertThat(result.status()).isEqualTo(ProjectStatus.in_progress);
    }

    @Test
    void shouldThrow404ForOtherUsersProjects() {
        UUID otherUserId = UUID.randomUUID();
        when(repository.findByIdAndOwnerId(project.getId(), otherUserId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getProject(project.getId(), otherUserId))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404 NOT_FOUND");
    }
}
