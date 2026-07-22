package com.weekdays.api.calendar;

import com.weekdays.api.auth.UserDetailsImpl;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/calendar")
public class CalendarController {

    private final CalendarService calendarService;

    public CalendarController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @GetMapping
    public List<EventResponse> getAllEvents(
            @AuthenticationPrincipal UserDetailsImpl principal) {
        return calendarService.getAllEvents(principal.getUser().getId());
    }

    @GetMapping("/{id}")
    public EventResponse getEvent(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable UUID id) {
        return calendarService.getEvent(id, principal.getUser().getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse createEvent(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @Valid @RequestBody CreateEventRequest request) {
        return calendarService.createEvent(request, principal.getUser());
    }

    @PutMapping("/{id}")
    public EventResponse updateEvent(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateEventRequest request) {
        return calendarService.updateEvent(id, request, principal.getUser().getId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @PathVariable UUID id) {
        calendarService.deleteEvent(id, principal.getUser().getId());
    }

    @GetMapping("/month")
    public List<EventResponse> getMonthEvents(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @RequestParam int year,
            @RequestParam int month) {
        return calendarService.getMonthEvents(principal.getUser().getId(), year, month);
    }

    @GetMapping("/week")
    public List<EventResponse> getWeekEvents(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return calendarService.getWeekEvents(principal.getUser().getId(), date);
    }

    @GetMapping("/day")
    public List<EventResponse> getDayEvents(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return calendarService.getDayEvents(principal.getUser().getId(), date);
    }

    @GetMapping("/range")
    public List<EventResponse> getRangeEvents(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return calendarService.getRangeEvents(principal.getUser().getId(), from, to);
    }
}
