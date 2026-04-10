package com.tns.appraisal.dashboard;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final DashboardRepository dashboardRepository;

    public DashboardService(DashboardRepository dashboardRepository) {
        this.dashboardRepository = dashboardRepository;
    }

    @Transactional(readOnly = true)
    public EmployeeDashboardData getEmployeeDashboard(Long employeeId) {
        Long totalForms = dashboardRepository.countFormsByEmployee(employeeId);
        Long pendingForms = dashboardRepository.countFormsByEmployeeAndStatus(employeeId, "NOT_STARTED");
        Long submittedForms = dashboardRepository.countFormsByEmployeeAndStatus(employeeId, "SUBMITTED");
        Long completedForms = dashboardRepository.countFormsByEmployeeAndStatus(employeeId, "REVIEWED_AND_COMPLETED");
        return new EmployeeDashboardData(totalForms, pendingForms, submittedForms, completedForms);
    }

    @Transactional(readOnly = true)
    public ManagerDashboardData getManagerDashboard(Long managerId) {
        Long totalTeamForms = dashboardRepository.countFormsByReviewer(managerId);
        Long pendingReview = dashboardRepository.countFormsByReviewerAndStatus(managerId, "SUBMITTED");
        Long completedReviews = dashboardRepository.countFormsByReviewerAndStatus(managerId, "REVIEWED_AND_COMPLETED");
        Double completionPercentage = totalTeamForms > 0
            ? (completedReviews.doubleValue() / totalTeamForms.doubleValue()) * 100 : 0.0;
        List<TeamMemberStats> teamStats = dashboardRepository.getTeamMemberStatsRaw(managerId)
            .stream().map(row -> new TeamMemberStats(
                (String) row[0], (String) row[1], ((Number) row[2]).longValue()
            )).toList();
        return new ManagerDashboardData(totalTeamForms, pendingReview, completedReviews, completionPercentage, teamStats);
    }

    @Transactional(readOnly = true)
    public HrDashboardData getHrDashboard() {
        Long totalForms = dashboardRepository.countAllForms();
        Long pendingEmployee = dashboardRepository.countFormsByStatus("NOT_STARTED");
        Long pendingReview = dashboardRepository.countFormsByStatus("SUBMITTED");
        Long completed = dashboardRepository.countFormsByStatus("REVIEWED_AND_COMPLETED");
        Double overallCompletion = totalForms > 0
            ? (completed.doubleValue() / totalForms.doubleValue()) * 100 : 0.0;

        List<DepartmentStats> departmentStats = dashboardRepository.getDepartmentStatsRaw()
            .stream().map(row -> new DepartmentStats(
                (String) row[0],
                ((Number) row[1]).longValue(),
                ((Number) row[2]).longValue(),
                ((Number) row[1]).longValue() > 0
                    ? ((Number) row[2]).doubleValue() / ((Number) row[1]).doubleValue() * 100 : 0.0
            )).toList();

        List<CycleStats> cycleStats = dashboardRepository.getCycleStatsRaw()
            .stream().map(row -> new CycleStats(
                (String) row[0],
                ((Number) row[1]).longValue(),
                ((Number) row[2]).longValue(),
                ((Number) row[1]).longValue() > 0
                    ? ((Number) row[2]).doubleValue() / ((Number) row[1]).doubleValue() * 100 : 0.0
            )).toList();

        return new HrDashboardData(totalForms, pendingEmployee, pendingReview, completed,
                                  overallCompletion, departmentStats, cycleStats);
    }

    @Transactional(readOnly = true)
    public List<EmployeeFormStatus> getEmployeeFormStatusList(Long cycleId) {
        return dashboardRepository.getEmployeeFormStatusRaw(cycleId)
            .stream().map(row -> new EmployeeFormStatus(
                ((Number) row[0]).longValue(),   // formId
                (String) row[1],                  // employeeName
                (String) row[2],                  // department
                (String) row[3],                  // status
                row[4] != null ? row[4].toString() : null,  // submittedAt
                row[5] != null ? row[5].toString() : null,  // reviewedAt
                (String) row[6],                  // pdfPath
                (String) row[7],                  // cycleName
                ((Number) row[8]).longValue()     // cycleId
            )).toList();
    }

    @Transactional(readOnly = true)
    public List<CycleSummary> getAllCycles() {
        return dashboardRepository.getAllCyclesRaw()
            .stream().map(row -> new CycleSummary(
                ((Number) row[0]).longValue(),
                (String) row[1],
                (String) row[2],
                row[3] != null ? row[3].toString() : null,
                row[4] != null ? row[4].toString() : null,
                ((Number) row[5]).longValue(),
                ((Number) row[6]).longValue()
            )).toList();
    }

    @Transactional(readOnly = true)
    public FormDetail getFormDetail(Long formId) {
        List<Object[]> rows = dashboardRepository.getFormDetailRaw(formId);
        if (rows.isEmpty()) throw new RuntimeException("Form not found: " + formId);
        Object[] row = rows.get(0);
        return new FormDetail(
            ((Number) row[0]).longValue(),
            (String) row[1],
            (String) row[2],
            (String) row[3],
            (String) row[4],
            (String) row[5],
            row[6] != null ? row[6].toString() : null,
            row[7] != null ? row[7].toString() : null,
            (String) row[8],
            (String) row[9]
        );
    }

    @Transactional(readOnly = true)
    public void exportToCsv(Long cycleId, PrintWriter writer) {
        writer.println("Employee Name,Department,Status,Submitted At,Reviewed At,Cycle");
        getEmployeeFormStatusList(cycleId).forEach(e ->
            writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                e.employeeName(),
                nvl(e.department()),
                e.status(),
                nvl(e.submittedAt()),
                nvl(e.reviewedAt()),
                e.cycleName())
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getStatusDistribution() {
        Map<String, Long> distribution = new HashMap<>();
        for (Object[] result : dashboardRepository.getStatusDistribution()) {
            distribution.put((String) result[0], (Long) result[1]);
        }
        return distribution;
    }

    private String nvl(String val) { return val != null ? val : ""; }

    // ── DTOs ──────────────────────────────────────────────────────────────────

    public record EmployeeDashboardData(Long totalForms, Long pendingForms, Long submittedForms, Long completedForms) {}

    public record ManagerDashboardData(Long totalTeamForms, Long pendingReview, Long completedReviews,
                                       Double completionPercentage, List<TeamMemberStats> teamStats) {}

    public record HrDashboardData(Long totalForms, Long pendingEmployee, Long pendingReview, Long completed,
                                  Double overallCompletion, List<DepartmentStats> departmentStats,
                                  List<CycleStats> cycleStats) {}

    public record TeamMemberStats(String employeeName, String status, Long formCount) {}

    public record DepartmentStats(String department, Long totalForms, Long completedForms, Double completionPercentage) {}

    public record CycleStats(String cycleName, Long totalForms, Long completedForms, Double completionPercentage) {}

    public record EmployeeFormStatus(Long formId, String employeeName, String department, String status,
                                     String submittedAt, String reviewedAt, String pdfPath,
                                     String cycleName, Long cycleId) {}

    public record CycleSummary(Long id, String name, String status, String startDate, String endDate,
                               Long totalForms, Long completedForms) {}

    public record FormDetail(Long formId, String employeeName, String department, String managerName,
                             String status, String formData, String submittedAt, String reviewedAt,
                             String pdfPath, String cycleName) {}
}
