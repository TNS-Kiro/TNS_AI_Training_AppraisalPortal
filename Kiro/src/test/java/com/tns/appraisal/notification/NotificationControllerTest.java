package com.tns.appraisal.notification;

import com.tns.appraisal.common.dto.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NotificationController.class)
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationService notificationService;

    private NotificationTemplate testTemplate;
    private EmailNotificationLog testLog;

    @BeforeEach
    void setUp() {
        testTemplate = new NotificationTemplate(
            "CYCLE_TRIGGERED",
            "Test Subject",
            "Test Body"
        );

        testLog = new EmailNotificationLog();
        testLog.setRecipientEmail("test@example.com");
        testLog.setTriggerEvent("CYCLE_TRIGGERED");
        testLog.setSubject("Test Subject");
        testLog.setStatus("SENT");
    }

    @Test
    @WithMockUser(roles = "HR")
    void getAllTemplates_AsHR_ShouldReturnTemplates() throws Exception {
        // Arrange
        Page<NotificationTemplate> page = new PageImpl<>(List.of(testTemplate));
        when(notificationService.getAllTemplates(any())).thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/notifications/templates"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content[0].triggerEvent").value("CYCLE_TRIGGERED"));
    }

    @Test
    @WithMockUser(roles = "EMPLOYEE")
    void getAllTemplates_AsEmployee_ShouldBeForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/notifications/templates"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getTemplate_AsAdmin_ShouldReturnTemplate() throws Exception {
        // Arrange
        when(notificationService.getTemplate("CYCLE_TRIGGERED")).thenReturn(testTemplate);

        // Act & Assert
        mockMvc.perform(get("/api/notifications/templates/CYCLE_TRIGGERED"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.triggerEvent").value("CYCLE_TRIGGERED"))
            .andExpect(jsonPath("$.data.subject").value("Test Subject"));
    }

    @Test
    @WithMockUser(roles = "HR")
    void updateTemplate_WithValidData_ShouldUpdateTemplate() throws Exception {
        // Arrange
        NotificationTemplate updatedTemplate = new NotificationTemplate(
            "CYCLE_TRIGGERED",
            "Updated Subject",
            "Updated Body"
        );
        when(notificationService.updateTemplate(eq(1L), any(), any(), any()))
            .thenReturn(updatedTemplate);

        String requestBody = """
            {
                "subject": "Updated Subject",
                "body": "Updated Body",
                "isActive": true
            }
            """;

        // Act & Assert
        mockMvc.perform(put("/api/notifications/templates/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.subject").value("Updated Subject"));
    }

    @Test
    @WithMockUser(roles = "HR")
    void searchLogs_WithFilters_ShouldReturnFilteredLogs() throws Exception {
        // Arrange
        Page<EmailNotificationLog> page = new PageImpl<>(List.of(testLog));
        when(notificationService.searchNotificationLogs(
            any(), any(), any(), any(), any(), any()
        )).thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/notifications/logs")
                .param("recipientEmail", "test@example.com")
                .param("status", "SENT"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.data.content[0].recipientEmail").value("test@example.com"))
            .andExpect(jsonPath("$.data.content[0].status").value("SENT"));
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    void searchLogs_AsManager_ShouldBeForbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/notifications/logs"))
            .andExpect(status().isForbidden());
    }
}
