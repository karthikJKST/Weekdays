package com.weekdays.api.calendar;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum CalendarEventType {
    task,
    project_deadline("project-deadline"),
    meeting,
    milestone,
    reminder;

    private final String jsonValue;

    CalendarEventType() {
        this.jsonValue = name();
    }

    CalendarEventType(String jsonValue) {
        this.jsonValue = jsonValue;
    }

    @JsonValue
    public String getJsonValue() {
        return jsonValue;
    }

    @JsonCreator
    public static CalendarEventType fromJson(String value) {
        if (value == null) return null;
        for (CalendarEventType t : values()) {
            if (t.jsonValue.equals(value)) return t;
        }
        return CalendarEventType.valueOf(value);
    }
}
