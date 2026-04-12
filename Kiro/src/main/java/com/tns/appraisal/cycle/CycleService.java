package com.tns.appraisal.cycle;

import com.tns.appraisal.audit.AuditLogService;
import com.tns.appraisal.exception.ResourceNotFoundException;
import com.tns.appraisal.exception.UnauthorizedAccessException;
import com.tns.appraisal.exception.ValidationException;
import com.tns.appraisal.form.AppraisalForm;
import com.tns.appraisal.form.AppraisalFormRepository;
import com.tns.appraisal.template.AppraisalTemplate;
import com.tns.appraisal.template.AppraisalTemplateRepository;
import com.tns.appraisal.user.User;
import com.tns.appraisal.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Service for managing appraisal cycles.
 * Handles CRUD operations, cycle triggering, form reopening, and backup reviewer assignment.
 */
@Service
public class CycleService {

    private static final Logger logger = LoggerFactory.getLogger(CycleService.class);

    private final AppraisalCycleRepository cycleRepository;
    private final AppraisalTemplateRepository templateRepository;
    private final AppraisalFormRepository formRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public CycleService(
            AppraisalCycleRepository cycleRepository,
            AppraisalTemplateRepository templateRepository,
            AppraisalFormRepository formRepository,
            UserRepository userRepository,
            AuditLogService auditLogService) {
        this.cycleRepository = cycleRepository;
        this.templateRepository = templateRepository;
        this.formRepository = formRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    // ==================== CRUD ====================

    @Transactional
    public AppraisalCycle create(AppraisalCycle cycle, Long currentUserId) {
        logger.info("Creating new appraisal cycle: {}", cycle.getName());
        validateCycle(cycle);
        cycle.setCreatedBy(currentUserId);
        cycle.setStatus("DRAFT");
        AppraisalCycle saved = cycleRepository.save(cycle);
        auditLogService.logAsync(currentUserId, "CYCLE_CREATED", "AppraisalCycle", saved.getId(),
                Map.of("cycleName", saved.getName()), null);
        logger.info("Appraisal cycle created with ID: {}", saved.getId());
        return saved;
    }

    @Transactional
    public AppraisalCycle update(Long id, AppraisalCycle updatedCycle, Long currentUserId) {
        logger.info("Updating appraisal cycle ID: {}", id);
        AppraisalCycle existing = cycleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appraisal cycle not found with ID: " + id));
        validateCycle(updatedCycle);
        existing.setName(updatedCycle.getName());
        existing.setStartDate(updatedCycle.getStartDate());
        existing.setEndDate(updatedCycle.getEndDate());
        existing.setTemplate(updatedCycle.getTemplate());
        AppraisalCycle saved = cycleRepository.save(existing);
        auditLogService.logAsync(currentUserId, "CYCLE_UPDATED", "AppraisalCycle", saved.getId(),
                Map.of("cycleName", saved.getName()), null);
        return saved;
    }

    @Transactional(readOnly = true)
    public AppraisalCycle findById(Long id) {
        return cycleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appraisal cycle not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<AppraisalCycle> findAll() {
        return cycleRepository.findAll();
    }

    @Transactional
    public void delete(Long id, Long currentUserId) {
        AppraisalCycle cycle = cycleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appraisal cycle not found with ID: " + id));
        cycleRepository.delete(cycle);
        auditLogService.logAsync(currentUserId, "CYCLE_DELETED", "AppraisalCycle", id,
                Map.of("cycleName", cycle.getName()), null);
    }

    // ==================== Trigger ====================

    /**
     * Trigger an appraisal cycle for selected employees.
     * Creates one AppraisalForm per employee. Implements partial-failure resilience:
     * individual failures are logged and counted but do not abort the batch.
     *
     * Validates: Property 6 (exactly one form per employee) and Property 18 (partial failure resilience).
     */
    @Transactional
    public TriggerCycleResult triggerCycle(Long cycleId, List<Long> employeeIds, Long currentUserId) {
        logger.info("Triggering appraisal cycle ID: {} for {} employees", cycleId, employeeIds.size());

        AppraisalCycle cycle = cycleRepository.findById(cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("Appraisal cycle not found with ID: " + cycleId));

        AppraisalTemplate activeTemplate = templateRepository.findByIsActiveTrue()
                .orElseThrow(() -> new ValidationException("No active appraisal template found"));

        cycle.setStatus("ACTIVE");
        cycleRepository.save(cycle);

        int successCount = 0;
        int failureCount = 0;
        List<TriggerCycleResult.EmployeeFailure> failures = new ArrayList<>();

        for (Long employeeId : employeeIds) {
            try {
                // Skip if form already exists for this employee in this cycle
                if (formRepository.existsByCycleIdAndEmployeeId(cycleId, employeeId)) {
                    logger.warn("Form already exists for employee {} in cycle {}, skipping", employeeId, cycleId);
                    successCount++;
                    continue;
                }

                User employee = userRepository.findById(employeeId)
                        .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + employeeId));

                if (employee.getManager() == null) {
                    throw new ValidationException("Employee " + employeeId + " has no assigned manager");
                }

                AppraisalForm form = new AppraisalForm();
                form.setCycleId(cycleId);
                form.setEmployeeId(employeeId);
                form.setManagerId(employee.getManager().getId());
                form.setTemplateId(activeTemplate.getId());
                form.setStatus("NOT_STARTED");
                formRepository.save(form);

                logger.info("Created appraisal form for employee ID: {}", employeeId);
                successCount++;

            } catch (Exception ex) {
                logger.error("Failed to process employee ID {}: {}", employeeId, ex.getMessage(), ex);
                failureCount++;
                failures.add(new TriggerCycleResult.EmployeeFailure(
                        employeeId,
                        ex.getMessage() != null ? ex.getMessage() : "Unknown error"
                ));
            }
        }

        auditLogService.logAsync(currentUserId, "CYCLE_TRIGGERED", "AppraisalCycle", cycleId,
                Map.of(
                        "cycleName", cycle.getName(),
                        "totalEmployees", employeeIds.size(),
                        "successCount", successCount,
                        "failureCount", failureCount,
                        "templateId", activeTemplate.getId()
                ), null);

        logger.info("Cycle triggered: {} - Success: {}, Failures: {}", cycleId, successCount, failureCount);
        return new TriggerCycleResult(employeeIds.size(), successCount, failureCount, failures);
    }

    // ==================== Reopen ====================

    /**
     * Reopen a submitted or completed appraisal form, resetting its status to DRAFT_SAVED.
     * Only HR users may reopen forms.
     *
     * Validates: Property 8 (form reopen resets status).
     */
    @Transactional
    public void reopenForm(Long cycleId, Long formId, Long currentUserId, List<String> userRoles) {
        logger.info("Reopening form ID: {} in cycle ID: {}", formId, cycleId);

        if (!userRoles.contains("HR")) {
            throw new UnauthorizedAccessException("Only HR users can reopen forms");
        }

        cycleRepository.findById(cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("Appraisal cycle not found with ID: " + cycleId));

        AppraisalForm form = formRepository.findById(formId)
                .orElseThrow(() -> new ResourceNotFoundException("Appraisal form not found with ID: " + formId));

        if (!form.getCycleId().equals(cycleId)) {
            throw new ValidationException("Form does not belong to the specified cycle");
        }

        String currentStatus = form.getStatus();
        if (!"SUBMITTED".equals(currentStatus) && !"REVIEWED_AND_COMPLETED".equals(currentStatus)) {
            throw new ValidationException(
                    "Form can only be reopened from SUBMITTED or REVIEWED_AND_COMPLETED status. Current: " + currentStatus);
        }

        form.setStatus("DRAFT_SAVED");
        form.setSubmittedAt(null);
        form.setReviewStartedAt(null);
        form.setReviewedAt(null);
        formRepository.save(form);

        auditLogService.logAsync(currentUserId, "FORM_REOPENED", "AppraisalForm", formId,
                Map.of("cycleId", cycleId, "previousStatus", currentStatus), null);

        logger.info("Form {} reopened from {} to DRAFT_SAVED", formId, currentStatus);
    }

    // ==================== Backup Reviewer ====================

    /**
     * Assign a backup reviewer (MANAGER or HR role) to an appraisal form.
     * The backup reviewer gains the same review permissions as the primary manager.
     *
     * Validates: Property 19 (backup reviewer permission equivalence).
     * Requirements: 3.7, 3.8, 15.2, 15.3.
     */
    @Transactional
    public void assignBackupReviewer(Long cycleId, Long formId, Long backupReviewerId, Long currentUserId) {
        logger.info("Assigning backup reviewer {} to form {} in cycle {}", backupReviewerId, formId, cycleId);

        cycleRepository.findById(cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("Appraisal cycle not found with ID: " + cycleId));

        AppraisalForm form = formRepository.findById(formId)
                .orElseThrow(() -> new ResourceNotFoundException("Appraisal form not found with ID: " + formId));

        if (!form.getCycleId().equals(cycleId)) {
            throw new ValidationException(
                    String.format("Form ID %d does not belong to cycle ID %d", formId, cycleId));
        }

        User backupReviewer = userRepository.findById(backupReviewerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Backup reviewer user not found with ID: " + backupReviewerId));

        boolean hasManagerOrHrRole = backupReviewer.getRoles().stream()
                .anyMatch(r -> "MANAGER".equals(r.getName()) || "HR".equals(r.getName()));

        if (!hasManagerOrHrRole) {
            throw new ValidationException(
                    String.format("User ID %d cannot be assigned as backup reviewer. " +
                            "Must have MANAGER or HR role.", backupReviewerId));
        }

        form.setBackupReviewerId(backupReviewerId);
        formRepository.save(form);

        auditLogService.logAsync(currentUserId, "BACKUP_REVIEWER_ASSIGNED", "AppraisalForm", formId,
                Map.of("cycleId", cycleId, "backupReviewerId", backupReviewerId), null);

        logger.info("Backup reviewer {} assigned to form {}", backupReviewerId, formId);
    }

    // ==================== Helpers ====================

    /**
     * Get all forms for a given cycle.
     */
    @Transactional(readOnly = true)
    public List<AppraisalForm> getFormsForCycle(Long cycleId) {
        cycleRepository.findById(cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("Appraisal cycle not found with ID: " + cycleId));
        return formRepository.findByCycleId(cycleId);
    }

    private void validateCycle(AppraisalCycle cycle) {
        if (cycle.getName() == null || cycle.getName().trim().isEmpty()) {
            throw new ValidationException("Cycle name is required");
        }
        if (cycle.getStartDate() == null) {
            throw new ValidationException("Start date is required");
        }
        if (cycle.getEndDate() == null) {
            throw new ValidationException("End date is required");
        }
        if (cycle.getEndDate().isBefore(cycle.getStartDate())) {
            throw new ValidationException("End date must be after start date");
        }
        if (cycle.getTemplate() == null) {
            throw new ValidationException("Template is required");
        }
    }
}
