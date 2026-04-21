package com.tns.appraisal.dashboard;

import com.tns.appraisal.dashboard.DashboardService.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private DashboardRepository dashboardRepository;

    @InjectMocks
    private DashboardService dashboardService;

    private Long employeeId;
    private Long managerId;

    @BeforeEach
    void setUp() {
        employeeId = 1L;
        managerId = 2L;
    }

    @Test
    void getEmployeeDashboard_ShouldReturnCorrectStats() {
        // Arrange
        when(dashboardRepository.countFormsByEmployee(employeeId)).thenReturn(10L);
        when(dashboardRepository.countFormsByEmployeeAndStatus(employeeId, "PENDING_EMPLOYEE")).thenReturn(3L);
        when(dashboardRepository.countFormsByEmployeeAndStatus(employeeId, "SUBMITTED")).thenReturn(2L);
        when(dashboardRepository.countFormsByEmployeeAndStatus(employeeId, "REVIEWED_AND_COMPLETED")).thenReturn(5L);

        // Act
        EmployeeDashboardData result = dashboardService.getEmployeeDashboard(employeeId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.totalForms()).isEqualTo(10L);
        assertThat(result.pendingForms()).isEqualTo(3L);
        assertThat(result.submittedForms()).isEqualTo(2L);
        assertThat(result.completedForms()).isEqualTo(5L);
    }

    @Test
    void getEmployeeDashboard_WithNoForms_ShouldReturnZeros() {
        // Arrange
        when(dashboardRepository.countFormsByEmployee(employeeId)).thenReturn(0L);
        when(dashboardRepository.countFormsByEmployeeAndStatus(employeeId, "PENDING_EMPLOYEE")).thenReturn(0L);
        when(dashboardRepository.countFormsByEmployeeAndStatus(employeeId, "SUBMITTED")).thenReturn(0L);
        when(dashboardRepository.countFormsByEmployeeAndStatus(employeeId, "REVIEWED_AND_COMPLETED")).thenReturn(0L);

        // Act
        EmployeeDashboardData result = dashboardService.getEmployeeDashboard(employeeId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.totalForms()).isEqualTo(0L);
        assertThat(result.pendingForms()).isEqualTo(0L);
        assertThat(result.submittedForms()).isEqualTo(0L);
        assertThat(result.completedForms()).isEqualTo(0L);
    }

    @Test
    void getManagerDashboard_ShouldReturnCorrectStatsWithPercentage() {
        // Arrange
        when(dashboardRepository.countFormsByReviewer(managerId)).thenReturn(20L);
        when(dashboardRepository.countFormsByReviewerAndStatus(managerId, "SUBMITTED")).thenReturn(5L);
        when(dashboardRepository.countFormsByReviewerAndStatus(managerId, "REVIEWED_AND_COMPLETED")).thenReturn(15L);

        List<TeamMemberStats> teamStats = Arrays.asList(
            new TeamMemberStats("John Doe", "COMPLETED", 5L),
            new TeamMemberStats("Jane Smith", "SUBMITTED", 3L)
        );
        when(dashboardRepository.getTeamMemberStatsRaw(managerId)).thenReturn(teamStats);

        // Act
        ManagerDashboardData result = dashboardService.getManagerDashboard(managerId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.totalTeamForms()).isEqualTo(20L);
        assertThat(result.pendingReview()).isEqualTo(5L);
        assertThat(result.completedReviews()).isEqualTo(15L);
        assertThat(result.completionPercentage()).isEqualTo(75.0);
        assertThat(result.teamStats()).hasSize(2);
    }

    @Test
    void getManagerDashboard_WithNoForms_ShouldReturnZeroPercentage() {
        // Arrange
        when(dashboardRepository.countFormsByReviewer(managerId)).thenReturn(0L);
        when(dashboardRepository.countFormsByReviewerAndStatus(managerId, "SUBMITTED")).thenReturn(0L);
        when(dashboardRepository.countFormsByReviewerAndStatus(managerId, "REVIEWED_AND_COMPLETED")).thenReturn(0L);
        when(dashboardRepository.getTeamMemberStatsRaw(managerId)).thenReturn(List.of());

        // Act
        ManagerDashboardData result = dashboardService.getManagerDashboard(managerId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.totalTeamForms()).isEqualTo(0L);
        assertThat(result.completionPercentage()).isEqualTo(0.0);
        assertThat(result.teamStats()).isEmpty();
    }

    @Test
    void getHrDashboard_ShouldReturnOrgWideStats() {
        // Arrange
        when(dashboardRepository.countAllForms()).thenReturn(100L);
        when(dashboardRepository.countFormsByStatus("PENDING_EMPLOYEE")).thenReturn(30L);
        when(dashboardRepository.countFormsByStatus("SUBMITTED")).thenReturn(20L);
        when(dashboardRepository.countFormsByStatus("REVIEWED_AND_COMPLETED")).thenReturn(50L);

        List<DepartmentStats> deptStats = Arrays.asList(
            new DepartmentStats("Engineering", 50L, 30L, 60.0),
            new DepartmentStats("Sales", 30L, 20L, 66.67)
        );
        when(dashboardRepository.getDepartmentStatsRaw()).thenReturn(deptStats);

        List<CycleStats> cycleStats = Arrays.asList(
            new CycleStats("Q1 2024", 60L, 40L, 66.67),
            new CycleStats("Q2 2024", 40L, 10L, 25.0)
        );
        when(dashboardRepository.getCycleStatsRaw()).thenReturn(cycleStats);

        // Act
        HrDashboardData result = dashboardService.getHrDashboard();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.totalForms()).isEqualTo(100L);
        assertThat(result.pendingEmployee()).isEqualTo(30L);
        assertThat(result.pendingReview()).isEqualTo(20L);
        assertThat(result.completed()).isEqualTo(50L);
        assertThat(result.overallCompletion()).isEqualTo(50.0);
        assertThat(result.departmentStats()).hasSize(2);
        assertThat(result.cycleStats()).hasSize(2);
    }

    @Test
    void getHrDashboard_WithNoForms_ShouldReturnZeroPercentage() {
        // Arrange
        when(dashboardRepository.countAllForms()).thenReturn(0L);
        when(dashboardRepository.countFormsByStatus("PENDING_EMPLOYEE")).thenReturn(0L);
        when(dashboardRepository.countFormsByStatus("SUBMITTED")).thenReturn(0L);
        when(dashboardRepository.countFormsByStatus("REVIEWED_AND_COMPLETED")).thenReturn(0L);
        when(dashboardRepository.getDepartmentStatsRaw()).thenReturn(List.of());
        when(dashboardRepository.getCycleStatsRaw()).thenReturn(List.of());

        // Act
        HrDashboardData result = dashboardService.getHrDashboard();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.totalForms()).isEqualTo(0L);
        assertThat(result.overallCompletion()).isEqualTo(0.0);
        assertThat(result.departmentStats()).isEmpty();
        assertThat(result.cycleStats()).isEmpty();
    }

    @Test
    void getStatusDistribution_ShouldReturnCorrectMapping() {
        // Arrange
        List<Object[]> mockResults = Arrays.asList(
            new Object[]{"PENDING_EMPLOYEE", 30L},
            new Object[]{"SUBMITTED", 20L},
            new Object[]{"COMPLETED", 50L}
        );
        when(dashboardRepository.getStatusDistribution()).thenReturn(mockResults);

        // Act
        Map<String, Long> result = dashboardService.getStatusDistribution();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result.get("PENDING_EMPLOYEE")).isEqualTo(30L);
        assertThat(result.get("SUBMITTED")).isEqualTo(20L);
        assertThat(result.get("REVIEWED_AND_COMPLETED")).isEqualTo(50L);
    }

    @Test
    void getStatusDistribution_WithNoData_ShouldReturnEmptyMap() {
        // Arrange
        when(dashboardRepository.getStatusDistribution()).thenReturn(List.of());

        // Act
        Map<String, Long> result = dashboardService.getStatusDistribution();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void getManagerDashboard_CompletionPercentageCalculation_ShouldBeAccurate() {
        // Arrange - Test various completion scenarios
        when(dashboardRepository.countFormsByReviewer(managerId)).thenReturn(100L);
        when(dashboardRepository.countFormsByReviewerAndStatus(managerId, "SUBMITTED")).thenReturn(25L);
        when(dashboardRepository.countFormsByReviewerAndStatus(managerId, "REVIEWED_AND_COMPLETED")).thenReturn(75L);
        when(dashboardRepository.getTeamMemberStatsRaw(managerId)).thenReturn(List.of());

        // Act
        ManagerDashboardData result = dashboardService.getManagerDashboard(managerId);

        // Assert
        assertThat(result.completionPercentage()).isEqualTo(75.0);
    }

    @Test
    void getHrDashboard_CompletionPercentageCalculation_ShouldBeAccurate() {
        // Arrange
        when(dashboardRepository.countAllForms()).thenReturn(200L);
        when(dashboardRepository.countFormsByStatus("PENDING_EMPLOYEE")).thenReturn(50L);
        when(dashboardRepository.countFormsByStatus("SUBMITTED")).thenReturn(50L);
        when(dashboardRepository.countFormsByStatus("REVIEWED_AND_COMPLETED")).thenReturn(100L);
        when(dashboardRepository.getDepartmentStatsRaw()).thenReturn(List.of());
        when(dashboardRepository.getCycleStatsRaw()).thenReturn(List.of());

        // Act
        HrDashboardData result = dashboardService.getHrDashboard();

        // Assert
        assertThat(result.overallCompletion()).isEqualTo(50.0);
    }
}
