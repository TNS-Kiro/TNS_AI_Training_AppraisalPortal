package com.tns.appraisal.pdf;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Service for generating PDF documents from appraisal forms using iText 7.
 */
@Service
public class PdfGenerationService {

    private static final Logger logger = LoggerFactory.getLogger(PdfGenerationService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MMM-yyyy")
        .withZone(ZoneId.systemDefault());

    @Value("${appraisal.pdf.storage.path:./appraisal-pdfs}")
    private String pdfStoragePath;

    /**
     * Generate PDF in memory and return as byte array (no file storage needed).
     */
    public byte[] generateAppraisalPdfBytes(Long formId, Map<String, Object> formData,
                                             String employeeName, String reviewerName,
                                             String cycleName, Instant completedAt) {
        try {
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            try (PdfWriter writer = new PdfWriter(baos);
                 PdfDocument pdfDoc = new PdfDocument(writer);
                 Document document = new Document(pdfDoc)) {
                addHeader(document, employeeName, cycleName, completedAt);
                addFormContent(document, formData);
                addSignatures(document, employeeName, reviewerName, completedAt);
            }
            return baos.toByteArray();
        } catch (Exception e) {
            logger.error("Failed to generate PDF bytes for formId={}", formId, e);
            throw new RuntimeException("PDF generation failed", e);
        }
    }

    /**
     * Generate PDF for an appraisal form and save to disk.
     */
    public String generateAppraisalPdf(Long formId, Map<String, Object> formData, 
                                      String employeeName, String reviewerName, 
                                      Instant completedAt) {
        try {
            ensureStorageDirectoryExists();
            String fileName = String.format("appraisal_%d_%d.pdf", formId, System.currentTimeMillis());
            String filePath = Paths.get(pdfStoragePath, fileName).toString();

            try (FileOutputStream fos = new FileOutputStream(filePath);
                 PdfWriter writer = new PdfWriter(fos);
                 PdfDocument pdfDoc = new PdfDocument(writer);
                 Document document = new Document(pdfDoc)) {

                addHeader(document, employeeName, "", completedAt);
                addFormContent(document, formData);
                addSignatures(document, employeeName, reviewerName, completedAt);

                logger.info("PDF generated successfully: formId={}, path={}", formId, filePath);
                return filePath;
            }
        } catch (Exception e) {
            logger.error("Failed to generate PDF for formId={}", formId, e);
            throw new RuntimeException("PDF generation failed", e);
        }
    }

    /**
     * Retrieve PDF file as byte array.
     */
    public byte[] retrievePdf(String filePath) {
        try {
            Path path = Paths.get(filePath);
            if (!Files.exists(path)) {
                throw new RuntimeException("PDF file not found: " + filePath);
            }
            return Files.readAllBytes(path);
        } catch (Exception e) {
            logger.error("Failed to retrieve PDF: {}", filePath, e);
            throw new RuntimeException("PDF retrieval failed", e);
        }
    }

    /**
     * Delete PDF file.
     */
    public void deletePdf(String filePath) {
        try {
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
            logger.info("PDF deleted: {}", filePath);
        } catch (Exception e) {
            logger.error("Failed to delete PDF: {}", filePath, e);
        }
    }

    private void ensureStorageDirectoryExists() {
        File directory = new File(pdfStoragePath);
        if (!directory.exists()) {
            directory.mkdirs();
        }
    }

    private void addHeader(Document document, String employeeName, String cycleName, Instant completedAt) {
        document.add(new Paragraph("TnS Appraisal Form V3.0")
            .setFontSize(18).setBold().setTextAlignment(TextAlignment.CENTER));
        document.add(new Paragraph("Employee Performance Appraisal")
            .setFontSize(14).setTextAlignment(TextAlignment.CENTER).setMarginBottom(20));

        Table infoTable = new Table(UnitValue.createPercentArray(new float[]{1, 2})).useAllAvailableWidth();
        infoTable.addCell(createCell("Employee Name:", true));
        infoTable.addCell(createCell(employeeName, false));
        infoTable.addCell(createCell("Appraisal Cycle:", true));
        infoTable.addCell(createCell(cycleName != null ? cycleName : "", false));
        infoTable.addCell(createCell("Completion Date:", true));
        infoTable.addCell(createCell(DATE_FORMATTER.format(completedAt), false));
        document.add(infoTable);
        document.add(new Paragraph("\n"));
    }

    private void addFormContent(Document document, Map<String, Object> formData) {
        if (formData == null) return;

        Map<String, String> sectionTitles = new java.util.LinkedHashMap<>();
        sectionTitles.put("key_responsibilities", "Key Responsibilities");
        sectionTitles.put("idp", "Individual Development Plan (IDP)");
        sectionTitles.put("policy_adherence", "Company Policy & Business Continuity Adherence");
        sectionTitles.put("goals", "Goals");
        sectionTitles.put("manager_comments", "Manager Comments");

        Map<String, String> fieldLabels = Map.of(
            "responsibility_1", "Primary Responsibility",
            "achievement_1", "Key Achievements",
            "rating_1", "Self Rating",
            "skill_gap", "Skill Gaps Identified",
            "learning_goal", "Learning Goals",
            "attendance", "Attendance",
            "conduct", "Professional Conduct",
            "goal_1", "Goal 1",
            "goal_2", "Goal 2"
        );

        for (Map.Entry<String, String> entry : sectionTitles.entrySet()) {
            Object sectionData = formData.get(entry.getKey());
            if (sectionData == null) continue;
            addSection(document, entry.getValue(), sectionData, fieldLabels);
        }
    }

    private void addSection(Document document, String title, Object sectionData, Map<String, String> fieldLabels) {
        document.add(new Paragraph(title).setFontSize(13).setBold().setMarginTop(12)
            .setBackgroundColor(ColorConstants.LIGHT_GRAY));

        if (sectionData instanceof Map) {
            Map<String, Object> section = (Map<String, Object>) sectionData;
            section.forEach((key, value) -> {
                String label = fieldLabels.getOrDefault(key, key.replace("_", " "));
                document.add(new Paragraph(label + ": " + (value != null ? value.toString() : "N/A"))
                    .setFontSize(10).setMarginLeft(15).setMarginTop(4));
            });
        } else if (sectionData != null) {
            document.add(new Paragraph(sectionData.toString()).setFontSize(10).setMarginLeft(15));
        }
        document.add(new Paragraph("").setMarginBottom(6));
    }

    private void addSignatures(Document document, String employeeName, String reviewerName, Instant completedAt) {
        document.add(new Paragraph("\n\nSignatures")
            .setFontSize(14)
            .setBold());

        Table signatureTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
            .useAllAvailableWidth()
            .setMarginTop(20);

        signatureTable.addCell(createCell("Employee Signature:", true));
        signatureTable.addCell(createCell("Reviewer Signature:", true));
        signatureTable.addCell(createCell(employeeName, false));
        signatureTable.addCell(createCell(reviewerName, false));
        signatureTable.addCell(createCell("Date: " + DATE_FORMATTER.format(completedAt), false));
        signatureTable.addCell(createCell("Date: " + DATE_FORMATTER.format(completedAt), false));

        document.add(signatureTable);
    }

    private Cell createCell(String content, boolean isHeader) {
        Cell cell = new Cell().add(new Paragraph(content));
        if (isHeader) {
            cell.setBackgroundColor(ColorConstants.LIGHT_GRAY).setBold();
        }
        return cell;
    }
}
