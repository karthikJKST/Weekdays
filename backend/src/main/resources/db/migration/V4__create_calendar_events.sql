CREATE TABLE calendar_events (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    task_id UUID REFERENCES tasks(id),
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    event_type VARCHAR(30) NOT NULL DEFAULT 'task',
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    all_day BOOLEAN NOT NULL DEFAULT false,
    color VARCHAR(32) NOT NULL DEFAULT 'indigo',
    location VARCHAR(200) NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_calendar_events_owner_id ON calendar_events(owner_id);
CREATE INDEX idx_calendar_events_project_id ON calendar_events(project_id);
CREATE INDEX idx_calendar_events_task_id ON calendar_events(task_id);
CREATE INDEX idx_calendar_events_event_type ON calendar_events(event_type);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
