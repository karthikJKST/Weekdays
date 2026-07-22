CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES users(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'todo',
    priority VARCHAR(20) NOT NULL DEFAULT 'none',
    due_date DATE,
    assignee_id UUID REFERENCES users(id),
    assignee_name VARCHAR(100),
    estimated_hours DOUBLE PRECISION NOT NULL DEFAULT 0,
    spent_hours DOUBLE PRECISION NOT NULL DEFAULT 0,
    position INT NOT NULL DEFAULT 0,
    labels TEXT NOT NULL DEFAULT '',
    checklist TEXT NOT NULL DEFAULT '[]',
    comments TEXT NOT NULL DEFAULT '[]',
    archived BOOLEAN NOT NULL DEFAULT false,
    archived_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_tasks_owner_id ON tasks(owner_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_archived ON tasks(archived);
CREATE INDEX idx_tasks_position ON tasks(position);
