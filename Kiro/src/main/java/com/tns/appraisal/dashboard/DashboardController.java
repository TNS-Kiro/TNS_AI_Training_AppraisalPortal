package com.tns.appraisal.dashboard;

import com.tns.appraisal.common.dto.ApiResponse;
import com.tns.appraisal.dashboard.DashboardService.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/hr")
    public ResponseEntity<ApiResponse<HrDashboardData>> getHrDashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getHrDashboard()));
    }

    @GetMapping("/hr/employees")
    public ResponseEntity<ApiResponse<List<EmployeeFormStatus>>> getEmployeeList(
            @RequestParam(required = false) Long cycleId) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getEmployeeFormStatusList(cycleId)));
    }

    @GetMapping("/hr/cycles")
    public ResponseEntity<ApiResponse<List<CycleSummary>>> getAllCycles() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getAllCycles()));
    }

    @GetMapping("/hr/forms/{formId}")
    public ResponseEntity<ApiResponse<FormDetail>> getFormDetail(@PathVariable Long formId) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getFormDetail(formId)));
    }

    @GetMapping("/hr/export")
    public void exportCsv(@RequestParam(required = false) Long cycleId,
                          HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"appraisal-report.csv\"");
        PrintWriter writer = response.getWriter();
        dashboardService.exportToCsv(cycleId, writer);
        writer.flush();
    }

    @GetMapping("/manager/{managerId}")
    public ResponseEntity<ApiResponse<ManagerDashboardData>> getManagerDashboard(@PathVariable Long managerId) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getManagerDashboard(managerId)));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<EmployeeDashboardData>> getEmployeeDashboard(@PathVariable Long employeeId) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getEmployeeDashboard(employeeId)));
    }

    @GetMapping("/status-distribution")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getStatusDistribution() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getStatusDistribution()));
    }
}
