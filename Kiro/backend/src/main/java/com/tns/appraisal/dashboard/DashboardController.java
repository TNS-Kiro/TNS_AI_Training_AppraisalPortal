package com.tns.appraisal.dashboard;

import com.tns.appraisal.common.dto.ApiResponse;
import com.tns.appraisal.form.AppraisalForm;
import com.tns.appraisal.form.AppraisalFormRepository;
import com.tns.appraisal.form.FormStatus;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * REST controller exposing dashboard endpoints for Employee, Manager, and HR roles.
 * Delegates all data aggregation to DashboardService.
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);

    private final DashboardService dashboardService;
    private final AppraisalFormRepository formRepository;

    public DashboardController(DashboardService dashboardService,
                               AppraisalFormRepository formRepository) {
        this.dashboardService = dashboardService;
        this.formRepository = formRepository;
    }

    // ── HR Endpoints ──────────────────────────────────────────────────────────

    @GetMapping("/hr")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<ApiResponse<DashboardService.HrDashboardData>> getHrDashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getHrDashboard()));
    }

    @GetMapping("/hr/employees")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<DashboardService.EmployeeFormStatus>>> getEmployeeList(
            @RequestParam(required = false) Long cycleId) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getEmployeeFormStatusList(cycleId)));
    }

    @GetMapping("/hr/cycles")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<DashboardService.CycleSummary>>> getAllCycles() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getAllCycles()));
    }

    @GetMapping("/hr/forms/{formId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<ApiResponse<DashboardService.FormDetail>> getFormDetail(
            @PathVariable Long formId) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getFormDetail(formId)));
    }

    @GetMapping("/hr/export")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public void exportCsv(@RequestParam(required = false) Long cycleId,
                          HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"appraisal-report.csv\"");
        PrintWriter writer = response.getWriter();
        dashboardService.exportToCsv(cycleId, writer);
        writer.flush();
    }

    // ── Manager Endpoints ─────────────────────────────────────────────────────

    /**
     * Manager dashboard: returns own form + team forms + stats.
     * User ID is derived from the authenticated session.
     */
    @GetMapping("/manager")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getManagerDashboard(Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        logger.info("Loading manager dashboard for user {}", userId);

        List<AppraisalForm> ownForms = formRepository.findByEmployeeIdWithRelations(userId);
        AppraisalForm ownForm = ownForms.stream()
            .filter(f -> f.getStatus() != FormStatus.REVIEWED_AND_COMPLETED)
            .findFirst().orElse(null);

        List<AppraisalForm> teamForms = formRepository.findByManager_Id(userId);

        long pendingReviews = teamForms.stream()
            .filter(f -> f.getStatus() == FormStatus.SUBMITTED
                      || f.getStatus() == FormStatus.UNDER_REVIEW
                      || f.getStatus() == FormStatus.REVIEW_DRAFT_SAVED)
            .count();
        long completedReviews = teamForms.stream()
            .filter(f -> f.getStatus() == FormStatus.REVIEWED_AND_COMPLETED)
            .count();
        double completionPct = teamForms.isEmpty() ? 0 :
            (completedReviews * 100.0) / teamForms.size();

        Map<String, Object> data = new HashMap<>();
        data.put("ownForm", ownForm != null ? toFormSummaryMap(ownForm) : null);
        data.put("teamForms", teamForms.stream().map(this::toFormSummaryMap).collect(Collectors.toList()));
        data.put("pendingReviews", pendingReviews);
        data.put("completedReviews", completedReviews);
        data.put("completionPercentage", Math.round(completionPct));
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // ── Employee Endpoints ────────────────────────────────────────────────────

    /**
     * Employee dashboard: returns current active form + all historical forms.
     * User ID is derived from the authenticated session.
     */
    @GetMapping("/employee")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEmployeeDashboard(Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        logger.info("Loading employee dashboard for user {}", userId);

        List<AppraisalForm> forms = formRepository.findByEmployeeIdWithRelations(userId);

        // Current form = most recent non-completed form
        AppraisalForm currentForm = forms.stream()
            .filter(f -> f.getStatus() != FormStatus.REVIEWED_AND_COMPLETED)
            .findFirst().orElse(null);

        List<Map<String, Object>> historicalForms = forms.stream()
            .map(this::toFormSummaryMap)
            .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("currentForm", currentForm != null ? toFormSummaryMap(currentForm) : null);
        data.put("historicalForms", historicalForms);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    // ── Shared ────────────────────────────────────────────────────────────────

    @GetMapping("/status-distribution")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStatusDistribution() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getStatusDistribution()));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Map<String, Object> toFormSummaryMap(AppraisalForm form) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", form.getId());
        map.put("cycleId", form.getCycleId());
        map.put("employeeId", form.getEmployeeId());
        map.put("employeeName", form.getEmployee() != null ? form.getEmployee().getFullName() : null);
        map.put("employeeCode", form.getEmployee() != null ? form.getEmployee().getEmployeeId() : null);
        map.put("managerId", form.getManagerId());
        map.put("managerName", form.getManager() != null ? form.getManager().getFullName() : null);
        map.put("templateId", form.getTemplateId());
        map.put("status", form.getStatus() != null ? form.getStatus().name() : "NOT_STARTED");
        map.put("submittedAt", form.getSubmittedAt());
        map.put("reviewedAt", form.getReviewedAt());
        map.put("createdAt", form.getCreatedAt());
        map.put("updatedAt", form.getUpdatedAt());
        return map;
    }
}
