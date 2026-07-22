package com.weekdays.api.task;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    // Basic owner-scoped queries
    List<Task> findAllByOwnerIdOrderByUpdatedAtDesc(UUID ownerId);

    List<Task> findAllByOwnerIdAndProjectIdOrderByUpdatedAtDesc(UUID ownerId, UUID projectId);

    Optional<Task> findByIdAndOwnerId(UUID id, UUID ownerId);

    List<Task> findAllByIdInAndOwnerId(List<UUID> ids, UUID ownerId);

    void deleteAllByIdInAndOwnerId(List<UUID> ids, UUID ownerId);

    long countByOwnerIdAndStatus(UUID ownerId, TaskStatus status);

    long countByOwnerIdAndArchivedFalse(UUID ownerId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.owner.id = :ownerId AND t.archived = false AND t.status = 'done'")
    long countCompletedByOwnerId(@Param("ownerId") UUID ownerId);

    @Query("SELECT SUM(t.estimatedHours) FROM Task t WHERE t.owner.id = :ownerId AND t.archived = false")
    Double sumEstimatedHoursByOwnerId(@Param("ownerId") UUID ownerId);

    @Query("SELECT SUM(t.spentHours) FROM Task t WHERE t.owner.id = :ownerId AND t.archived = false")
    Double sumSpentHoursByOwnerId(@Param("ownerId") UUID ownerId);

    @Query("SELECT t.status, COUNT(t) FROM Task t WHERE t.owner.id = :ownerId AND t.archived = false GROUP BY t.status")
    List<Object[]> countByStatusGrouped(@Param("ownerId") UUID ownerId);

    @Query("SELECT t.priority, COUNT(t) FROM Task t WHERE t.owner.id = :ownerId AND t.archived = false GROUP BY t.priority")
    List<Object[]> countByPriorityGrouped(@Param("ownerId") UUID ownerId);

    @Query("SELECT t FROM Task t WHERE t.owner.id = :ownerId AND t.archived = false AND t.dueDate IS NOT NULL AND t.dueDate <= :date AND t.status <> 'done' ORDER BY t.dueDate ASC")
    List<Task> findOverdueForAnalytics(@Param("ownerId") UUID ownerId, @Param("date") LocalDate date);

    @Query("SELECT t FROM Task t WHERE t.owner.id = :ownerId AND t.archived = false AND t.updatedAt >= :since ORDER BY t.updatedAt DESC")
    List<Task> findRecentActivity(@Param("ownerId") UUID ownerId, @Param("since") Instant since);

    // Archived state queries
    List<Task> findAllByOwnerIdAndArchivedFalseOrderByUpdatedAtDesc(UUID ownerId);

    List<Task> findAllByOwnerIdAndProjectIdAndArchivedFalseOrderByUpdatedAtDesc(UUID ownerId, UUID projectId);

    List<Task> findAllByOwnerIdAndArchivedTrueOrderByUpdatedAtDesc(UUID ownerId);

    // Date-based queries (non-archived)
    List<Task> findAllByOwnerIdAndDueDateAndArchivedFalse(UUID ownerId, LocalDate dueDate);

    List<Task> findAllByOwnerIdAndDueDateBeforeAndArchivedFalse(UUID ownerId, LocalDate dueDate);

    @Query("SELECT t FROM Task t WHERE t.owner.id = :ownerId AND t.dueDate > :fromDate AND t.archived = false ORDER BY t.dueDate ASC")
    List<Task> findUpcomingByOwnerId(@Param("ownerId") UUID ownerId, @Param("fromDate") LocalDate fromDate);

    // Status-based queries (non-archived)
    List<Task> findAllByOwnerIdAndStatusAndArchivedFalseOrderByUpdatedAtDesc(UUID ownerId, TaskStatus status);

    // Search
    @Query("SELECT t FROM Task t WHERE t.owner.id = :ownerId AND t.archived = false AND (LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%'))) ORDER BY t.updatedAt DESC")
    List<Task> searchByOwnerId(@Param("ownerId") UUID ownerId, @Param("query") String query);

    // Project-specific archived
    List<Task> findAllByOwnerIdAndProjectIdAndArchivedTrueOrderByUpdatedAtDesc(UUID ownerId, UUID projectId);
}
