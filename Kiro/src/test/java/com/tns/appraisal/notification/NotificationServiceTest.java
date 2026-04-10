package com.tns.appraisal.notification;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private NotificationTemplateRepository templateRepository;

    @Mock
    private EmailNotificationLogRepository logRepository;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private NotificationService notificationService;

    private NotificationTemplate testTemplate;
    private Map<String, String> placeholders;

    @BeforeEach
    void setUp() {
        testTemplate = new NotificationTemplate(
            "CYCLE_TRIGGERED",
            "Appraisal Cycle Started - {{cycleName}}",
            "Dear {{employeeName}}, your appraisal cycle {{cycleName}} has been triggered."
        );
        testTemplate.setIsActive(true);

        placeholders = new HashMap<>();
        placeholders.put("cycleName", "Q1 2024");
        placeholders.put("employeeName", "John Doe");
    }

    @Test
    void sendNotificationAsync_WithValidTemplate_ShouldSendEmail() {
        // Arrange
        when(templateRepository.findByTriggerEventAndIsActiveTrue("CYCLE_TRIGGERED"))
            .thenReturn(Optional.of(testTemplate));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        when(logRepository.save(any(EmailNotificationLog.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        notificationService.sendNotificationAsync("CYCLE_TRIGGERED", "test@example.com", placeholders);

        // Give async method time to execute
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Assert
        verify(mailSender, timeout(1000)).send(any(MimeMessage.class));
        verify(logRepository, timeout(1000)).save(argThat(log ->
            log.getRecipientEmail().equals("test@example.com") &&
            log.getTriggerEvent().equals("CYCLE_TRIGGERED") &&
            log.getStatus().equals("SENT")
        ));
    }

    @Test
    void sendNotificationAsync_WithInvalidTemplate_ShouldLogFailure() {
        // Arrange
        when(templateRepository.findByTriggerEventAndIsActiveTrue("INVALID_EVENT"))
            .thenReturn(Optional.empty());
        when(logRepository.save(any(EmailNotificationLog.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        notificationService.sendNotificationAsync("INVALID_EVENT", "test@example.com", placeholders);

        // Give async method time to execute
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Assert
        verify(mailSender, never()).send(any(MimeMessage.class));
        verify(logRepository, timeout(1000)).save(argThat(log ->
            log.getStatus().equals("FAILED") &&
            log.getErrorMessage() != null
        ));
    }

    @Test
    void getTemplate_WithExistingEvent_ShouldReturnTemplate() {
        // Arrange
        when(templateRepository.findByTriggerEvent("CYCLE_TRIGGERED"))
            .thenReturn(Optional.of(testTemplate));

        // Act
        NotificationTemplate result = notificationService.getTemplate("CYCLE_TRIGGERED");

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTriggerEvent()).isEqualTo("CYCLE_TRIGGERED");
        assertThat(result.getSubject()).contains("{{cycleName}}");
    }

    @Test
    void getTemplate_WithNonExistingEvent_ShouldThrowException() {
        // Arrange
        when(templateRepository.findByTriggerEvent("NON_EXISTING"))
            .thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> notificationService.getTemplate("NON_EXISTING"))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Template not found");
    }

    @Test
    void getAllTemplates_ShouldReturnPagedTemplates() {
        // Arrange
        List<NotificationTemplate> templates = List.of(testTemplate);
        Page<NotificationTemplate> page = new PageImpl<>(templates);
        Pageable pageable = PageRequest.of(0, 10);
        when(templateRepository.findAll(pageable)).thenReturn(page);

        // Act
        Page<NotificationTemplate> result = notificationService.getAllTemplates(pageable);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTriggerEvent()).isEqualTo("CYCLE_TRIGGERED");
    }

    @Test
    void updateTemplate_WithValidData_ShouldUpdateAndReturn() {
        // Arrange
        Long templateId = 1L;
        when(templateRepository.findById(templateId)).thenReturn(Optional.of(testTemplate));
        when(templateRepository.save(any(NotificationTemplate.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        NotificationTemplate result = notificationService.updateTemplate(
            templateId,
            "New Subject",
            "New Body",
            false
        );

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getSubject()).isEqualTo("New Subject");
        assertThat(result.getBody()).isEqualTo("New Body");
        assertThat(result.getIsActive()).isFalse();
        verify(templateRepository).save(testTemplate);
    }

    @Test
    void updateTemplate_WithNonExistingId_ShouldThrowException() {
        // Arrange
        when(templateRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> notificationService.updateTemplate(999L, "Subject", "Body", true))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Template not found");
    }

    @Test
    void searchNotificationLogs_WithFilters_ShouldReturnFilteredResults() {
        // Arrange
        EmailNotificationLog log = new EmailNotificationLog();
        log.setRecipientEmail("test@example.com");
        log.setTriggerEvent("CYCLE_TRIGGERED");
        log.setSubject("Test Subject");
        log.setStatus("SENT");
        Page<EmailNotificationLog> page = new PageImpl<>(List.of(log));
        Pageable pageable = PageRequest.of(0, 10);
        Instant startDate = Instant.now().minusSeconds(3600);
        Instant endDate = Instant.now();

        when(logRepository.searchNotificationLogs(
            "test@example.com",
            "CYCLE_TRIGGERED",
            "SENT",
            startDate,
            endDate,
            pageable
        )).thenReturn(page);

        // Act
        Page<EmailNotificationLog> result = notificationService.searchNotificationLogs(
            "test@example.com",
            "CYCLE_TRIGGERED",
            "SENT",
            startDate,
            endDate,
            pageable
        );

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getRecipientEmail()).isEqualTo("test@example.com");
        assertThat(result.getContent().get(0).getStatus()).isEqualTo("SENT");
    }

    @Test
    void placeholderSubstitution_ShouldReplaceAllPlaceholders() {
        // This tests the private method indirectly through sendNotificationAsync
        // Arrange
        when(templateRepository.findByTriggerEventAndIsActiveTrue("CYCLE_TRIGGERED"))
            .thenReturn(Optional.of(testTemplate));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        
        ArgumentCaptor<EmailNotificationLog> logCaptor = ArgumentCaptor.forClass(EmailNotificationLog.class);
        when(logRepository.save(logCaptor.capture()))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        notificationService.sendNotificationAsync("CYCLE_TRIGGERED", "test@example.com", placeholders);

        // Give async method time to execute
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Assert
        verify(logRepository, timeout(1000)).save(any(EmailNotificationLog.class));
        EmailNotificationLog savedLog = logCaptor.getValue();
        assertThat(savedLog.getSubject()).contains("Q1 2024");
        assertThat(savedLog.getSubject()).doesNotContain("{{cycleName}}");
    }
}
