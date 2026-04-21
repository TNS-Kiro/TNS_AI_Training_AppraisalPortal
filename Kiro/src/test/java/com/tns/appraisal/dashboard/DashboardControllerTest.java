package com.tns.appraisal.dashboard;

import com.tns.appraisal.dashboard.DashboardService.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DashboardController.class)
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    private EmployeeDashboardData employeeData;
    private ManagerDashboardData managerData;
    private HrDashboardData hrData;

    @BeforeEach
    void setUp() {
        employeeData = new EmployeeDashboardData(10L, 3L, 2L, 5L);
        
        managerData = new ManagerDashboardData(
            20L, 5L, 15L, 75.0,
            List.of(new TeamMemberStats("John Doe", "COMPLETED", 5L))
        );
        
        hrData = new HrDashboardData(
            100L, 30L, 20L, 50L, 50.0,
            List.of(new DepartmentStats("Engineering", 50L, 30L, 60.0)),
            List.of(new CycleStats("Q1 2024", 60L, 40L, 66.67))
        );
    }

    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void getEmployeeDashboard_AsEmployee_ShouldReturnData() throws Exception {
        // Arrange
        when(dashboardService.getEmployeeDashboard(1L)).thenReturn(employeeData);

        // Act & Assert
        mockMvc.perform(get("/api/dashboard/employee"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.totalForms").value(10))
            .andExpect(jsonPath("$.data.pendingForms").value(3))
            .andExpect(jsonPath("$.data.submittedForms").value(2))
            .andExpect(jsonPath("$.data.completedForms").value(5));
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    void getEmployeeDashboard_AsManager_ShouldBeForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/dashboard/employee"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    void getManagerDashboard_AsManager_ShouldReturnData() throws Exception {
        // Arrange
        when(dashboardService.getManagerDashboard(2L)).thenReturn(managerData);

        // Act & Assert
        mockMvc.perform(get("/api/dashboard/manager"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.totalTeamForms").value(20))
            .andExpect(jsonPath("$.data.pendingReview").value(5))
            .andExpect(jsonPath("$.data.completedReviews").value(15))
            .andExpect(jsonPath("$.data.completionPercentage").value(75.0))
            .andExpect(jsonPath("$.data.teamStats[0].employeeName").value("John Doe"));
    }

    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void getManagerDashboard_AsEmployee_ShouldBeForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/dashboard/manager"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "HR")
    void getHrDashboard_AsHR_ShouldReturnData() throws Exception {
        // Arrange
        when(dashboardService.getHrDashboard()).thenReturn(hrData);

        // Act & Assert
        mockMvc.perform(get("/api/dashboard/hr"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.totalForms").value(100))
            .andExpect(jsonPath("$.data.pendingEmployee").value(30))
            .andExpect(jsonPath("$.data.pendingReview").value(20))
            .andExpect(jsonPath("$.data.completed").value(50))
            .andExpect(jsonPath("$.data.overallCompletion").value(50.0))
            .andExpect(jsonPath("$.data.departmentStats[0].department").value("Engineering"))
            .andExpect(jsonPath("$.data.cycleStats[0].cycleName").value("Q1 2024"));
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    void getHrDashboard_AsManager_ShouldBeForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/dashboard/hr"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "HR")
    void getStatusDistribution_AsHR_ShouldReturnDistribution() throws Exception {
        // Arrange
        Map<String, Long> distribution = Map.of(
            "PENDING_EMPLOYEE", 30L,
            "SUBMITTED", 20L,
            "COMPLETED", 50L
        );
        when(dashboardService.getStatusDistribution()).thenReturn(distribution);

        // Act & Assert
        mockMvc.perform(get("/api/dashboard/status-distribution"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.PENDING_EMPLOYEE").value(30))
            .andExpect(jsonPath("$.data.SUBMITTED").value(20))
            .andExpect(jsonPath("$.data.COMPLETED").value(50));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getStatusDistribution_AsAdmin_ShouldReturnDistribution() throws Exception {
        // Arrange
        Map<String, Long> distribution = Map.of("COMPLETED", 100L);
        when(dashboardService.getStatusDistribution()).thenReturn(distribution);

        // Act & Assert
        mockMvc.perform(get("/api/dashboard/status-distribution"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
    }
}
