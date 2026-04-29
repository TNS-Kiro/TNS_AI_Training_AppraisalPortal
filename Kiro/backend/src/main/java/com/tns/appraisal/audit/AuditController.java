package com.tns.appraisal.audit;

import com.tns.appraisal.common.dto.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditController {

    private final AuditLogService auditLogService;

    public AuditController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AuditLog>>> searchAuditLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
            auditLogService.searchAuditLogs(userId, action, startDate, endDate, pageable)));
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getEntityAuditLogs(
            @PathVariable String entityType,
            @PathVariable Long entityId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
            auditLogService.getAuditLogsForEntity(entityType, entityId, pageable)));
    }
}
