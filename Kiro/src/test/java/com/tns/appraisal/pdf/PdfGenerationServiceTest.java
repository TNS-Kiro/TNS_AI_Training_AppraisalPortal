package com.tns.appraisal.pdf;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PdfGenerationServiceTest {

    private PdfGenerationService pdfGenerationService;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        pdfGenerationService = new PdfGenerationService();
        ReflectionTestUtils.setField(pdfGenerationService, "pdfStoragePath", tempDir.toString());
    }

    @Test
    void generateAppraisalPdf_WithValidData_ShouldCreatePdfFile() {
        // Arrange
        Long formId = 1L;
        Map<String, Object> formData = createTestFormData();
        String employeeName = "John Doe";
        String reviewerName = "Jane Smith";
        Instant completedAt = Instant.now();

        // Act
        String filePath = pdfGenerationService.generateAppraisalPdf(
            formId,
            formData,
            employeeName,
            reviewerName,
            completedAt
        );

        // Assert
        assertThat(filePath).isNotNull();
        assertThat(new File(filePath)).exists();
        assertThat(filePath).contains("appraisal_1_");
        assertThat(filePath).endsWith(".pdf");
    }

    @Test
    void generateAppraisalPdf_ShouldCreateStorageDirectory() {
        // Arrange
        Path newTempDir = tempDir.resolve("new-storage");
        ReflectionTestUtils.setField(pdfGenerationService, "pdfStoragePath", newTempDir.toString());
        
        Long formId = 1L;
        Map<String, Object> formData = createTestFormData();

        // Act
        String filePath = pdfGenerationService.generateAppraisalPdf(
            formId,
            formData,
            "John Doe",
            "Jane Smith",
            Instant.now()
        );

        // Assert
        assertThat(new File(newTempDir.toString())).exists();
        assertThat(new File(filePath)).exists();
    }

    @Test
    void generateAppraisalPdf_WithNullFormData_ShouldStillGeneratePdf() {
        // Arrange
        Long formId = 2L;

        // Act
        String filePath = pdfGenerationService.generateAppraisalPdf(
            formId,
            null,
            "John Doe",
            "Jane Smith",
            Instant.now()
        );

        // Assert
        assertThat(filePath).isNotNull();
        assertThat(new File(filePath)).exists();
    }

    @Test
    void retrievePdf_WithExistingFile_ShouldReturnByteArray() throws Exception {
        // Arrange
        Long formId = 3L;
        Map<String, Object> formData = createTestFormData();
        String filePath = pdfGenerationService.generateAppraisalPdf(
            formId,
            formData,
            "John Doe",
            "Jane Smith",
            Instant.now()
        );

        // Act
        byte[] pdfContent = pdfGenerationService.retrievePdf(filePath);

        // Assert
        assertThat(pdfContent).isNotNull();
        assertThat(pdfContent.length).isGreaterThan(0);
        
        // Verify it's a valid PDF (starts with PDF magic number)
        assertThat(pdfContent[0]).isEqualTo((byte) 0x25); // %
        assertThat(pdfContent[1]).isEqualTo((byte) 0x50); // P
        assertThat(pdfContent[2]).isEqualTo((byte) 0x44); // D
        assertThat(pdfContent[3]).isEqualTo((byte) 0x46); // F
    }

    @Test
    void retrievePdf_WithNonExistingFile_ShouldThrowException() {
        // Arrange
        String nonExistingPath = tempDir.resolve("non-existing.pdf").toString();

        // Act & Assert
        assertThatThrownBy(() -> pdfGenerationService.retrievePdf(nonExistingPath))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("PDF file not found");
    }

    @Test
    void deletePdf_WithExistingFile_ShouldDeleteFile() throws Exception {
        // Arrange
        Long formId = 4L;
        String filePath = pdfGenerationService.generateAppraisalPdf(
            formId,
            createTestFormData(),
            "John Doe",
            "Jane Smith",
            Instant.now()
        );
        assertThat(new File(filePath)).exists();

        // Act
        pdfGenerationService.deletePdf(filePath);

        // Assert
        assertThat(new File(filePath)).doesNotExist();
    }

    @Test
    void deletePdf_WithNonExistingFile_ShouldNotThrowException() {
        // Arrange
        String nonExistingPath = tempDir.resolve("non-existing.pdf").toString();

        // Act & Assert - should not throw exception
        pdfGenerationService.deletePdf(nonExistingPath);
    }

    @Test
    void generateAppraisalPdf_WithComplexFormData_ShouldIncludeAllSections() {
        // Arrange
        Long formId = 5L;
        Map<String, Object> formData = new HashMap<>();
        
        Map<String, Object> keyResponsibilities = new HashMap<>();
        keyResponsibilities.put("responsibility1", "Completed project X");
        keyResponsibilities.put("rating", "5");
        formData.put("keyResponsibilities", keyResponsibilities);

        Map<String, Object> idp = new HashMap<>();
        idp.put("goal1", "Learn new technology");
        formData.put("idp", idp);

        Map<String, Object> policyAdherence = new HashMap<>();
        policyAdherence.put("attendance", "Excellent");
        formData.put("policyAdherence", policyAdherence);

        Map<String, Object> goals = new HashMap<>();
        goals.put("q1Goal", "Increase productivity");
        formData.put("goals", goals);

        // Act
        String filePath = pdfGenerationService.generateAppraisalPdf(
            formId,
            formData,
            "John Doe",
            "Jane Smith",
            Instant.now()
        );

        // Assert
        assertThat(filePath).isNotNull();
        assertThat(new File(filePath)).exists();
        
        // Verify file size is reasonable (should contain content)
        File pdfFile = new File(filePath);
        assertThat(pdfFile.length()).isGreaterThan(1000); // At least 1KB
    }

    @Test
    void generateAppraisalPdf_MultipleFiles_ShouldHaveUniqueNames() throws InterruptedException {
        // Arrange
        Long formId = 6L;
        Map<String, Object> formData = createTestFormData();

        // Act
        String filePath1 = pdfGenerationService.generateAppraisalPdf(
            formId, formData, "John Doe", "Jane Smith", Instant.now()
        );
        
        Thread.sleep(10); // Ensure different timestamps
        
        String filePath2 = pdfGenerationService.generateAppraisalPdf(
            formId, formData, "John Doe", "Jane Smith", Instant.now()
        );

        // Assert
        assertThat(filePath1).isNotEqualTo(filePath2);
        assertThat(new File(filePath1)).exists();
        assertThat(new File(filePath2)).exists();
    }

    private Map<String, Object> createTestFormData() {
        Map<String, Object> formData = new HashMap<>();
        
        Map<String, Object> keyResponsibilities = new HashMap<>();
        keyResponsibilities.put("description", "Test responsibility");
        formData.put("keyResponsibilities", keyResponsibilities);

        Map<String, Object> idp = new HashMap<>();
        idp.put("goal", "Test goal");
        formData.put("idp", idp);

        return formData;
    }
}
