package com.tns.appraisal.audit;

import com.tns.appraisal.common.dto.ApiResponse;
import com.tns.appraisal.common.dto.PageResponse;
import com.tns.appraisal.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * REST controller for querying audit logs.
 * Access restricted to ADMIN role.
 */
@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private static final Logger logger = LoggerFactory.getLogger(AuditLogController.class);

    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    public AuditLogController(AuditLogService auditLogService, UserRepository userRepository) {
        this.auditLogService = auditLogService;
        this.userRepository = userRepository;
    }

    /**
     * Search audit logs with optional filters and pagination.
     * Returns enriched responses with user names.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> getAuditLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {

        logger.debug("Audit log search - userId: {}, action: {}, startDate: {}, endDate: {}, page: {}, size: {}",
                userId, action, startDate, endDate, page, size);

        Instant startInstant = startDate != null ? startDate.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        Instant endInstant = endDate != null ? endDate.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : null;

        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> auditPage = auditLogService.searchAuditLogs(userId, action, startInstant, endInstant, pageable);

        // Enrich with user names — batch fetch all unique user IDs
        Set<Long> userIds = auditPage.getContent().stream()
            .filter(log -> log.getUserId() != null)
            .map(AuditLog::getUserId)
            .collect(Collectors.toSet());

        Map<Long, String> userNames = userIds.stream()
            .collect(Collectors.toMap(
                uid -> uid,
                uid -> userRepository.findById(uid).map(u -> u.getFullName()).orElse("Unknown"),
                (a, b) -> a
            ));

        List<AuditLogResponse> enriched = auditPage.getContent().stream()
            .map(log -> new AuditLogResponse(log,
                log.getUserId() != null ? userNames.getOrDefault(log.getUserId(), "System") : "System"))
            .collect(Collectors.toList());

        Page<AuditLogResponse> enrichedPage = new PageImpl<>(enriched, pageable, auditPage.getTotalElements());
        PageResponse<AuditLogResponse> pageResponse = new PageResponse<>(enrichedPage);

        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }
}
