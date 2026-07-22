package com.weekdays.api.task;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private static final TypeReference<List<TaskResponse.TaskChecklistItem>> CHECKLIST_TYPE =
            new TypeReference<List<TaskResponse.TaskChecklistItem>>() {};
    private static final TypeReference<List<TaskResponse.TaskComment>> COMMENT_TYPE =
            new TypeReference<List<TaskResponse.TaskComment>>() {};
    private static final TypeReference<List<TaskLabel>> LABEL_TYPE =
            new TypeReference<List<TaskLabel>>() {};

    public TaskResponse toResponse(Task task) {
        List<TaskLabel> labels = parseLabels(task.getLabels());
        List<TaskResponse.TaskChecklistItem> checklist = parseChecklist(task.getChecklist());
        List<TaskResponse.TaskComment> comments = parseComments(task.getComments());

        TaskResponse.TaskAssignee assignee = task.getAssigneeName() != null && !task.getAssigneeName().isBlank()
                ? new TaskResponse.TaskAssignee(
                        task.getAssigneeId() != null ? task.getAssigneeId().toString() : "",
                        task.getAssigneeName())
                : null;

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getProject().getId().toString(),
                task.getProject().getName(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                assignee,
                task.getEstimatedHours(),
                task.getSpentHours(),
                task.getPosition(),
                labels,
                checklist,
                comments,
                task.isArchived(),
                task.getArchivedAt() != null ? task.getArchivedAt().atOffset(java.time.ZoneOffset.UTC) : null,
                task.getCreatedAt().atOffset(java.time.ZoneOffset.UTC),
                task.getUpdatedAt().atOffset(java.time.ZoneOffset.UTC)
        );
    }

    public List<TaskLabel> parseLabels(String labelsStr) {
        if (labelsStr == null || labelsStr.isBlank()) return List.of();
        try {
            return objectMapper.readValue(labelsStr, LABEL_TYPE);
        } catch (Exception e) {
            return List.of();
        }
    }

    public String toLabelsString(List<TaskLabel> labels) {
        if (labels == null || labels.isEmpty()) return "";
        try {
            return objectMapper.writeValueAsString(labels);
        } catch (Exception e) {
            return "";
        }
    }

    private List<TaskResponse.TaskChecklistItem> parseChecklist(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, CHECKLIST_TYPE);
        } catch (Exception e) {
            return List.of();
        }
    }

    public String toChecklistString(List<TaskResponse.TaskChecklistItem> items) {
        if (items == null || items.isEmpty()) return "[]";
        try {
            return objectMapper.writeValueAsString(items);
        } catch (Exception e) {
            return "[]";
        }
    }

    private List<TaskResponse.TaskComment> parseComments(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, COMMENT_TYPE);
        } catch (Exception e) {
            return List.of();
        }
    }

    public String toCommentsString(List<TaskResponse.TaskComment> items) {
        if (items == null || items.isEmpty()) return "[]";
        try {
            return objectMapper.writeValueAsString(items);
        } catch (Exception e) {
            return "[]";
        }
    }
}
