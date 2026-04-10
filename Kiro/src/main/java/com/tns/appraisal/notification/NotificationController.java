package com.tns.appraisal.notification;

import com.tns.appraisal.audit.AuditLogService;
import com.tns.appraisal.common.dto.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public NotificationController(NotificationService notificationService, AuditLogService auditLogService) {
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/templates")
    public ResponseEntity<ApiResponse<Page<NotificationTemplate>>> getAllTemplates(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getAllTemplates(pageable)));
    }

    @GetMapping("/templates/{triggerEvent}")
    public ResponseEntity<ApiResponse<NotificationTemplate>> getTemplate(@PathVariable String triggerEvent) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getTemplate(triggerEvent)));
    }

    @PutMapping("/templates/{id}")
    public ResponseEntity<ApiResponse<NotificationTemplate>> updateTemplate(
            @PathVariable Long id,
            @RequestBody UpdateTemplateRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        NotificationTemplate template = notificationService.updateTemplate(id, request.subject(), request.body(), request.isActive());
        auditLogService.logAsync(null, "TEMPLATE_UPDATED", "NotificationTemplate", id,
            Map.of("triggerEvent", template.getTriggerEvent(), "isActive", String.valueOf(request.isActive())),
            httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success(template));
    }

    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<Page<EmailNotificationLog>>> searchLogs(
            @RequestParam(required = false) String recipientEmail,
            @RequestParam(required = false) String triggerEvent,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Instant startDate,
            @RequestParam(required = false) Instant endDate,
            Pageable pageable) {
        Page<EmailNotificationLog> logs = notificationService.searchNotificationLogs(
            recipientEmail, triggerEvent, status, startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    record UpdateTemplateRequest(String subject, String body, Boolean isActive) {}
}
