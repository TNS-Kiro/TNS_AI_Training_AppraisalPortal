package com.tns.appraisal.form;

import com.tns.appraisal.common.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;

/**
 * Entity representing an individual employee appraisal form within a cycle.
 * Tracks the full lifecycle from NOT_STARTED through REVIEWED_AND_COMPLETED.
 */
@Entity
@Table(
    name = "appraisal_forms",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_form_cycle_employee",
        columnNames = {"cycle_id", "employee_id"}
    )
)
public class AppraisalForm extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cycle_id", nullable = false)
    private Long cycleId;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "manager_id", nullable = false)
    private Long managerId;

    @Column(name = "backup_reviewer_id")
    private Long backupReviewerId;

    @Column(name = "template_id", nullable = false)
    private Long templateId;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "NOT_STARTED";

    @Column(name = "form_data", columnDefinition = "NVARCHAR(MAX)")
    private String formData;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "review_started_at")
    private Instant reviewStartedAt;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "pdf_storage_path", length = 500)
    private String pdfStoragePath;

    public AppraisalForm() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCycleId() { return cycleId; }
    public void setCycleId(Long cycleId) { this.cycleId = cycleId; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public Long getManagerId() { return managerId; }
    public void setManagerId(Long managerId) { this.managerId = managerId; }

    public Long getBackupReviewerId() { return backupReviewerId; }
    public void setBackupReviewerId(Long backupReviewerId) { this.backupReviewerId = backupReviewerId; }

    public Long getTemplateId() { return templateId; }
    public void setTemplateId(Long templateId) { this.templateId = templateId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getFormData() { return formData; }
    public void setFormData(String formData) { this.formData = formData; }

    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }

    public Instant getReviewStartedAt() { return reviewStartedAt; }
    public void setReviewStartedAt(Instant reviewStartedAt) { this.reviewStartedAt = reviewStartedAt; }

    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getPdfStoragePath() { return pdfStoragePath; }
    public void setPdfStoragePath(String pdfStoragePath) { this.pdfStoragePath = pdfStoragePath; }
}
