package com.weekdays.api.project;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<Project, UUID> {

    List<Project> findAllByOwnerIdAndArchivedFalseOrderByUpdatedAtDesc(UUID ownerId);

    List<Project> findAllByOwnerIdOrderByUpdatedAtDesc(UUID ownerId);

    Optional<Project> findByIdAndOwnerId(UUID id, UUID ownerId);

    long countByOwnerIdAndArchivedFalse(UUID ownerId);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.owner.id = :ownerId AND p.archived = false AND p.status = 'done'")
    long countCompletedByOwnerId(@Param("ownerId") UUID ownerId);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.owner.id = :ownerId AND p.archived = false AND p.status = 'in_progress'")
    long countActiveByOwnerId(@Param("ownerId") UUID ownerId);
}
