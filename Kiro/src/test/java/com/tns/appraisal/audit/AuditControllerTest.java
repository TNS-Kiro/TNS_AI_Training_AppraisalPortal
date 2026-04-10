package com.tns.appraisal.audit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuditController.class)
class AuditControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuditLogService auditLogService;

    private AuditLog testLog;

    @BeforeEach
    void setUp() {
        testLog = new AuditLog(
            1L,
            "CREATE_FORM",
            "AppraisalForm",
            100L,
            "{\"formId\":100}",
            "192.168.1.1"
        );
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void searchAuditLogs_AsAdmin_ShouldReturnLogs() throws Exception {
        // Arrange
        Page<AuditLog> page = new PageImpl<>(List.of(testLog));
        when(auditLogService.searchAuditLogs(any(), any(), any(), any(), any()))
            .thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/audit-logs")
                .param("userId", "1")
                .param("action", "CREATE_FORM"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content[0].userId").value(1))
            .andExpect(jsonPath("$.data.content[0].action").value("CREATE_FORM"));
    }

    @Test
    @WithMockUser(roles = "HR")
    void searchAuditLogs_AsHR_ShouldReturnLogs() throws Exception {
        // Arrange
        Page<AuditLog> page = new PageImpl<>(List.of(testLog));
        when(auditLogService.searchAuditLogs(any(), any(), any(), any(), any()))
            .thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/audit-logs"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void searchAuditLogs_AsEmployee_ShouldBeForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/audit-logs"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    void searchAuditLogs_AsManager_ShouldBeForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/audit-logs"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void searchAuditLogs_WithDateFilters_ShouldReturnFilteredLogs() throws Exception {
        // Arrange
        Page<AuditLog> page = new PageImpl<>(List.of(testLog));
        when(auditLogService.searchAuditLogs(any(), any(), any(), any(), any()))
            .thenReturn(page);

        String startDate = "2024-01-01T00:00:00Z";
        String endDate = "2024-12-31T23:59:59Z";

        // Act & Assert
        mockMvc.perform(get("/api/audit-logs")
                .param("startDate", startDate)
                .param("endDate", endDate))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getEntityAuditLogs_ShouldReturnEntitySpecificLogs() throws Exception {
        // Arrange
        Page<AuditLog> page = new PageImpl<>(List.of(testLog));
        when(auditLogService.getAuditLogsForEntity(eq("AppraisalForm"), eq(100L), any()))
            .thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/audit-logs/entity/AppraisalForm/100"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content[0].entityType").value("AppraisalForm"))
            .andExpect(jsonPath("$.data.content[0].entityId").value(100));
    }

    @Test
    @WithMockUser(roles = "HR")
    void getEntityAuditLogs_AsHR_ShouldReturnLogs() throws Exception {
        // Arrange
        Page<AuditLog> page = new PageImpl<>(List.of(testLog));
        when(auditLogService.getAuditLogsForEntity(any(), any(), any()))
            .thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/audit-logs/entity/AppraisalForm/100"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void searchAuditLogs_WithPagination_ShouldReturnPagedResults() throws Exception {
        // Arrange
        Page<AuditLog> page = new PageImpl<>(
            List.of(testLog),
            PageRequest.of(0, 20),
            1
        );
        when(auditLogService.searchAuditLogs(any(), any(), any(), any(), any()))
            .thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/audit-logs")
                .param("page", "0")
                .param("size", "20"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content").isArray())
            .andExpect(jsonPath("$.data.totalElements").value(1));
    }
}
