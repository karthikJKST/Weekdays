CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(32) NOT NULL,
    link VARCHAR(500),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_owner_id ON notifications(owner_id);
CREATE INDEX idx_notifications_owner_created_at ON notifications(owner_id, created_at DESC);
