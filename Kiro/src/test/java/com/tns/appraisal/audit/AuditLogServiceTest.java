package com.tns.appraisal.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private AuditLogService auditLogService;

    private Long userId;
    private String action;
    private String entityType;
    private Long entityId;
    private Map<String, Object> details;
    private String ipAddress;

    @BeforeEach
    void setUp() {
        userId = 1L;
        action = "CREATE_FORM";
        entityType = "AppraisalForm";
        entityId = 100L;
        details = new HashMap<>();
        details.put("formId", 100);
        details.put("status", "PENDING");
        ipAddress = "192.168.1.1";
    }

    @Test
    void logAsync_WithValidData_ShouldCreateAuditLog() throws Exception {
        // Arrange
        String detailsJson = "{\"formId\":100,\"status\":\"PENDING\"}";
        when(objectMapper.writeValueAsString(details)).thenReturn(detailsJson);
        when(auditLogRepository.save(any(AuditLog.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        ArgumentCaptor<AuditLog> auditLogCaptor = ArgumentCaptor.forClass(AuditLog.class);

        // Act
        auditLogService.logAsync(userId, action, entityType, entityId, details, ipAddress);

        // Give async method time to execute
        Thread.sleep(100);

        // Assert
        verify(auditLogRepository, timeout(1000)).save(auditLogCaptor.capture());
        AuditLog savedLog = auditLogCaptor.getValue();
        
        assertThat(savedLog.getUserId()).isEqualTo(userId);
        assertThat(savedLog.getAction()).isEqualTo(action);
        assertThat(savedLog.getEntityType()).isEqualTo(entityType);
        assertThat(savedLog.getEntityId()).isEqualTo(entityId);
        assertThat(savedLog.getDetails()).isEqualTo(detailsJson);
        assertThat(savedLog.getIpAddress()).isEqualTo(ipAddress);
    }

    @Test
    void logAsync_WithNullDetails_ShouldCreateAuditLogWithNullDetails() throws Exception {
        // Arrange
        when(auditLogRepository.save(any(AuditLog.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        ArgumentCaptor<AuditLog> auditLogCaptor = ArgumentCaptor.forClass(AuditLog.class);

        // Act
        auditLogService.logAsync(userId, action, entityType, entityId, null, ipAddress);

        // Give async method time to execute
        Thread.sleep(100);

        // Assert
        verify(auditLogRepository, timeout(1000)).save(auditLogCaptor.capture());
        AuditLog savedLog = auditLogCaptor.getValue();
        
        assertThat(savedLog.getDetails()).isNull();
        verify(objectMapper, never()).writeValueAsString(any());
    }

    @Test
    void logAsync_WithSerializationError_ShouldNotThrowException() throws Exception {
        // Arrange
        when(objectMapper.writeValueAsString(details))
            .thenThrow(new RuntimeException("Serialization error"));

        // Act - should not throw exception
        auditLogService.logAsync(userId, action, entityType, entityId, details, ipAddress);

        // Give async method time to execute
        Thread.sleep(100);

        // Assert
        verify(auditLogRepository, never()).save(any(AuditLog.class));
    }

    @Test
    void logSync_WithValidData_ShouldCreateAuditLogSynchronously() throws Exception {
        // Arrange
        String detailsJson = "{\"formId\":100,\"status\":\"PENDING\"}";
        when(objectMapper.writeValueAsString(details)).thenReturn(detailsJson);
        when(auditLogRepository.save(any(AuditLog.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        ArgumentCaptor<AuditLog> auditLogCaptor = ArgumentCaptor.forClass(AuditLog.class);

        // Act
        auditLogService.logSync(userId, action, entityType, entityId, details, ipAddress);

        // Assert - should be immediate, no need to wait
        verify(auditLogRepository).save(auditLogCaptor.capture());
        AuditLog savedLog = auditLogCaptor.getValue();
        
        assertThat(savedLog.getUserId()).isEqualTo(userId);
        assertThat(savedLog.getAction()).isEqualTo(action);
        assertThat(savedLog.getEntityType()).isEqualTo(entityType);
        assertThat(savedLog.getEntityId()).isEqualTo(entityId);
        assertThat(savedLog.getDetails()).isEqualTo(detailsJson);
        assertThat(savedLog.getIpAddress()).isEqualTo(ipAddress);
    }

    @Test
    void logSync_WithSerializationError_ShouldThrowException() throws Exception {
        // Arrange
        when(objectMapper.writeValueAsString(details))
            .thenThrow(new RuntimeException("Serialization error"));

        // Act & Assert
        try {
            auditLogService.logSync(userId, action, entityType, entityId, details, ipAddress);
        } catch (RuntimeException e) {
            assertThat(e.getMessage()).contains("Failed to create audit log");
        }

        verify(auditLogRepository, never()).save(any(AuditLog.class));
    }

    @Test
    void searchAuditLogs_WithAllFilters_ShouldReturnFilteredResults() {
        // Arrange
        Instant startDate = Instant.now().minusSeconds(3600);
        Instant endDate = Instant.now();
        Pageable pageable = PageRequest.of(0, 10);

        AuditLog log = new AuditLog(userId, action, entityType, entityId, "{}", ipAddress);
        Page<AuditLog> expectedPage = new PageImpl<>(List.of(log));

        when(auditLogRepository.searchAuditLogs(userId, action, startDate, endDate, pageable))
            .thenReturn(expectedPage);

        // Act
        Page<AuditLog> result = auditLogService.searchAuditLogs(userId, action, startDate, endDate, pageable);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getUserId()).isEqualTo(userId);
        assertThat(result.getContent().get(0).getAction()).isEqualTo(action);
        verify(auditLogRepository).searchAuditLogs(userId, action, startDate, endDate, pageable);
    }

    @Test
    void searchAuditLogs_WithNullFilters_ShouldReturnAllResults() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        AuditLog log1 = new AuditLog(1L, "ACTION1", "Type1", 1L, "{}", "192.168.1.1");
        AuditLog log2 = new AuditLog(2L, "ACTION2", "Type2", 2L, "{}", "192.168.1.2");
        Page<AuditLog> expectedPage = new PageImpl<>(List.of(log1, log2));

        when(auditLogRepository.searchAuditLogs(null, null, null, null, pageable))
            .thenReturn(expectedPage);

        // Act
        Page<AuditLog> result = auditLogService.searchAuditLogs(null, null, null, null, pageable);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(2);
        verify(auditLogRepository).searchAuditLogs(null, null, null, null, pageable);
    }

    @Test
    void getAuditLogsForEntity_ShouldReturnEntityLogs() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        AuditLog log = new AuditLog(userId, action, entityType, entityId, "{}", ipAddress);
        Page<AuditLog> expectedPage = new PageImpl<>(List.of(log));

        when(auditLogRepository.findAll(pageable)).thenReturn(expectedPage);

        // Act
        Page<AuditLog> result = auditLogService.getAuditLogsForEntity(entityType, entityId, pageable);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        verify(auditLogRepository).findAll(pageable);
    }

    @Test
    void logAsync_WithEmptyDetails_ShouldCreateAuditLog() throws Exception {
        // Arrange
        Map<String, Object> emptyDetails = new HashMap<>();
        String emptyJson = "{}";
        when(objectMapper.writeValueAsString(emptyDetails)).thenReturn(emptyJson);
        when(auditLogRepository.save(any(AuditLog.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        ArgumentCaptor<AuditLog> auditLogCaptor = ArgumentCaptor.forClass(AuditLog.class);

        // Act
        auditLogService.logAsync(userId, action, entityType, entityId, emptyDetails, ipAddress);

        // Give async method time to execute
        Thread.sleep(100);

        // Assert
        verify(auditLogRepository, timeout(1000)).save(auditLogCaptor.capture());
        AuditLog savedLog = auditLogCaptor.getValue();
        assertThat(savedLog.getDetails()).isEqualTo(emptyJson);
    }

    @Test
    void logSync_WithComplexDetails_ShouldSerializeCorrectly() throws Exception {
        // Arrange
        Map<String, Object> complexDetails = new HashMap<>();
        complexDetails.put("user", Map.of("id", 1, "name", "John"));
        complexDetails.put("changes", List.of("field1", "field2"));
        
        String complexJson = "{\"user\":{\"id\":1,\"name\":\"John\"},\"changes\":[\"field1\",\"field2\"]}";
        when(objectMapper.writeValueAsString(complexDetails)).thenReturn(complexJson);
        when(auditLogRepository.save(any(AuditLog.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        ArgumentCaptor<AuditLog> auditLogCaptor = ArgumentCaptor.forClass(AuditLog.class);

        // Act
        auditLogService.logSync(userId, action, entityType, entityId, complexDetails, ipAddress);

        // Assert
        verify(auditLogRepository).save(auditLogCaptor.capture());
        AuditLog savedLog = auditLogCaptor.getValue();
        assertThat(savedLog.getDetails()).isEqualTo(complexJson);
    }
}
