package com.tns.appraisal.pdf;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/forms")
public class PdfController {

    private final PdfGenerationService pdfGenerationService;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public PdfController(PdfGenerationService pdfGenerationService,
                         JdbcTemplate jdbcTemplate,
                         ObjectMapper objectMapper) {
        this.pdfGenerationService = pdfGenerationService;
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        // Fetch form data directly from DB
        String sql = """
            SELECT f.form_data, f.status, f.submitted_at, f.reviewed_at,
                   u.full_name as employee_name, m.full_name as manager_name,
                   ac.name as cycle_name
            FROM appraisal_forms f
            JOIN users u ON f.employee_id = u.id
            LEFT JOIN users m ON f.manager_id = m.id
            JOIN appraisal_cycles ac ON f.cycle_id = ac.id
            WHERE f.id = ?
            """;

        var rows = jdbcTemplate.queryForList(sql, id);
        if (rows.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        var row = rows.get(0);
        String employeeName = (String) row.get("employee_name");
        String managerName  = row.get("manager_name") != null ? (String) row.get("manager_name") : "N/A";
        String cycleName    = (String) row.get("cycle_name");
        String formDataJson = (String) row.get("form_data");

        // Parse form_data JSON
        Map<String, Object> formData = Map.of();
        if (formDataJson != null) {
            try {
                formData = objectMapper.readValue(formDataJson, Map.class);
            } catch (Exception ignored) {}
        }

        // Use reviewed_at or submitted_at or now as the completion date
        Instant completedAt = Instant.now();
        if (row.get("reviewed_at") != null) {
            completedAt = ((java.sql.Timestamp) row.get("reviewed_at")).toInstant();
        } else if (row.get("submitted_at") != null) {
            completedAt = ((java.sql.Timestamp) row.get("submitted_at")).toInstant();
        }

        // Generate PDF in memory
        byte[] pdfBytes = pdfGenerationService.generateAppraisalPdfBytes(
            id, formData, employeeName, managerName, cycleName, completedAt);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "appraisal_" + id + ".pdf");

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
}
