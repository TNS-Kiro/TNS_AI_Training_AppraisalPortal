package com.tns.appraisal.cycle;

import com.tns.appraisal.common.dto.ApiResponse;
import com.tns.appraisal.exception.ResourceNotFoundException;
import com.tns.appraisal.form.AppraisalForm;
import com.tns.appraisal.template.AppraisalTemplateRepository;
import com.tns.appraisal.user.User;
import com.tns.appraisal.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller for managing appraisal cycles.
 * Provides endpoints for cycle CRUD operations, triggering, reopening forms, and backup reviewer assignment.
 */
@RestController
@RequestMapping("/api/cycles")
public class CycleController {

    private static final Logger logger = LoggerFactory.getLogger(CycleController.class);

    private final CycleService cycleService;
    private final AppraisalTemplateRepository templateRepository;
    private final UserRepository userRepository;

    public CycleController(CycleService cycleService,
                           AppraisalTemplateRepository templateRepository,
                           UserRepository userRepository) {
        this.cycleService = cycleService;
        this.templateRepository = templateRepository;
        this.userRepository = userRepository;
    }

    // ==================== Helper ====================

    private Long currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User user) {
            return user.getId();
        }
        if (auth != null && auth.getPrincipal() instanceof Long id) {
            return id;
        }
        return 0L; // fallback for unauthenticated dev requests
    }

    // ==================== Endpoints ====================

    /**
     * List all appraisal cycles.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<AppraisalCycle>>> listCycles() {
        logger.info("Fetching all appraisal cycles");
        List<AppraisalCycle> cycles = cycleService.findAll();
        return ResponseEntity.ok(ApiResponse.success(cycles));
    }

    /**
     * Get a cycle by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<ApiResponse<AppraisalCycle>> getCycleById(@PathVariable Long id) {
        logger.info("Fetching appraisal cycle ID: {}", id);
        AppraisalCycle cycle = cycleService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(cycle));
    }

    /**
     * Create a new appraisal cycle.
     */
    @PostMapping
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<AppraisalCycle>> createCycle(@RequestBody CreateCycleRequest request) {
        logger.info("Creating new appraisal cycle: {}", request.getName());

        AppraisalCycle cycle = new AppraisalCycle();
        cycle.setName(request.getName());
        cycle.setStartDate(request.getStartDate());
        cycle.setEndDate(request.getEndDate());

        if (request.getTemplateId() != null) {
            com.tns.appraisal.template.AppraisalTemplate template = templateRepository.findById(request.getTemplateId())
                    .orElseThrow(() -> new ResourceNotFoundException("Template not found with ID: " + request.getTemplateId()));
            cycle.setTemplate(template);
        }

        AppraisalCycle createdCycle = cycleService.create(cycle, currentUserId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Cycle created successfully", createdCycle));
    }

    /**
     * Update an existing appraisal cycle.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<AppraisalCycle>> updateCycle(
            @PathVariable Long id,
            @RequestBody UpdateCycleRequest request) {
        logger.info("Updating appraisal cycle ID: {}", id);

        AppraisalCycle cycle = new AppraisalCycle();
        cycle.setName(request.getName());
        cycle.setStartDate(request.getStartDate());
        cycle.setEndDate(request.getEndDate());

        if (request.getTemplateId() != null) {
            com.tns.appraisal.template.AppraisalTemplate template = templateRepository.findById(request.getTemplateId())
                    .orElseThrow(() -> new ResourceNotFoundException("Template not found with ID: " + request.getTemplateId()));
            cycle.setTemplate(template);
        }

        AppraisalCycle updatedCycle = cycleService.update(id, cycle, currentUserId());
        return ResponseEntity.ok(ApiResponse.success("Cycle updated successfully", updatedCycle));
    }

    /**
     * Trigger an appraisal cycle for selected employees.
     */
    @PostMapping("/{id}/trigger")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<TriggerCycleResult>> triggerCycle(
            @PathVariable Long id,
            @RequestBody TriggerCycleRequest request) {
        logger.info("Triggering appraisal cycle ID: {} for {} employees", id, request.getEmployeeIds().size());

        TriggerCycleResult result = cycleService.triggerCycle(id, request.getEmployeeIds(), currentUserId());

        String message = String.format(
                "Cycle triggered: %d successful, %d failed out of %d employees",
                result.getSuccessCount(), result.getFailureCount(), result.getTotalEmployees());

        return ResponseEntity.ok(ApiResponse.success(message, result));
    }

    /**
     * Reopen a submitted or completed appraisal form.
     */
    @PostMapping("/{id}/reopen/{formId}")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<String>> reopenForm(
            @PathVariable Long id,
            @PathVariable Long formId) {
        logger.info("Reopening form ID: {} in cycle ID: {}", formId, id);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        List<String> userRoles = auth != null
                ? auth.getAuthorities().stream()
                        .map(a -> a.getAuthority().replace("ROLE_", ""))
                        .toList()
                : List.of("HR");

        cycleService.reopenForm(id, formId, currentUserId(), userRoles);
        return ResponseEntity.ok(ApiResponse.success("Form reopened successfully", null));
    }

    /**
     * Assign a backup reviewer to an appraisal form.
     */
    @PutMapping("/{id}/backup-reviewer")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ApiResponse<String>> assignBackupReviewer(
            @PathVariable Long id,
            @RequestBody AssignBackupReviewerRequest request) {
        logger.info("Assigning backup reviewer {} to form ID: {} in cycle ID: {}",
                request.getBackupReviewerId(), request.getFormId(), id);

        cycleService.assignBackupReviewer(id, request.getFormId(), request.getBackupReviewerId(), currentUserId());
        return ResponseEntity.ok(ApiResponse.success("Backup reviewer assigned successfully", null));
    }

    /**
     * Get all appraisal forms for a cycle, enriched with employee/manager names.
     */
    @GetMapping("/{id}/forms")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<FormSummaryResponse>>> getCycleForms(@PathVariable Long id) {
        logger.info("Fetching forms for cycle ID: {}", id);
        List<AppraisalForm> forms = cycleService.getFormsForCycle(id);

        // Pre-fetch all unique user IDs to avoid N+1 queries
        Map<Long, String> userNames = forms.stream()
            .flatMap(f -> {
                java.util.stream.Stream.Builder<Long> ids = java.util.stream.Stream.builder();
                if (f.getEmployeeId() != null) ids.add(f.getEmployeeId());
                if (f.getManagerId() != null) ids.add(f.getManagerId());
                if (f.getBackupReviewerId() != null) ids.add(f.getBackupReviewerId());
                return ids.build();
            })
            .distinct()
            .collect(Collectors.toMap(
                uid -> uid,
                uid -> userRepository.findById(uid).map(User::getFullName).orElse("Unknown"),
                (a, b) -> a
            ));

        List<FormSummaryResponse> summaries = forms.stream()
            .map(f -> new FormSummaryResponse(
                f,
                userNames.getOrDefault(f.getEmployeeId(), "Unknown"),
                userNames.getOrDefault(f.getManagerId(), "Unknown"),
                f.getBackupReviewerId() != null ? userNames.getOrDefault(f.getBackupReviewerId(), null) : null
            ))
            .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(summaries));
    }

    // ==================== Request DTOs ====================

    /**
     * Request DTO for creating a new appraisal cycle.
     */
    public static class CreateCycleRequest {
        private String name;
        private LocalDate startDate;
        private LocalDate endDate;
        private Long templateId;

        public CreateCycleRequest() {
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public LocalDate getStartDate() {
            return startDate;
        }

        public void setStartDate(LocalDate startDate) {
            this.startDate = startDate;
        }

        public LocalDate getEndDate() {
            return endDate;
        }

        public void setEndDate(LocalDate endDate) {
            this.endDate = endDate;
        }

        public Long getTemplateId() {
            return templateId;
        }

        public void setTemplateId(Long templateId) {
            this.templateId = templateId;
        }
    }

    /**
     * Request DTO for updating an appraisal cycle.
     */
    public static class UpdateCycleRequest {
        private String name;
        private LocalDate startDate;
        private LocalDate endDate;
        private Long templateId;

        public UpdateCycleRequest() {
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public LocalDate getStartDate() {
            return startDate;
        }

        public void setStartDate(LocalDate startDate) {
            this.startDate = startDate;
        }

        public LocalDate getEndDate() {
            return endDate;
        }

        public void setEndDate(LocalDate endDate) {
            this.endDate = endDate;
        }

        public Long getTemplateId() {
            return templateId;
        }

        public void setTemplateId(Long templateId) {
            this.templateId = templateId;
        }
    }

    /**
     * Request DTO for triggering an appraisal cycle.
     */
    public static class TriggerCycleRequest {
        private List<Long> employeeIds;

        public TriggerCycleRequest() {
        }

        public List<Long> getEmployeeIds() {
            return employeeIds;
        }

        public void setEmployeeIds(List<Long> employeeIds) {
            this.employeeIds = employeeIds;
        }
    }

    /**
     * Request DTO for assigning a backup reviewer.
     */
    public static class AssignBackupReviewerRequest {
        private Long formId;
        private Long backupReviewerId;

        public AssignBackupReviewerRequest() {
        }

        public Long getFormId() {
            return formId;
        }

        public void setFormId(Long formId) {
            this.formId = formId;
        }

        public Long getBackupReviewerId() {
            return backupReviewerId;
        }

        public void setBackupReviewerId(Long backupReviewerId) {
            this.backupReviewerId = backupReviewerId;
        }
    }
}
