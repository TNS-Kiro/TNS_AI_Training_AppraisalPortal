package com.tns.appraisal.form.dto;

import com.tns.appraisal.form.FormStatus;
import java.time.Instant;

/**
 * Full DTO for a single appraisal form including parsed form data.
 */
public class FormDetailDto {

    private Long id;
    private Long cycleId;
    private String cycleName;
    private Long employeeId;
    private String employeeName;
    private String designation;
    private Long managerId;
    private String managerName;
    private Long backupReviewerId;
    private Long templateId;
    private FormStatus status;
    private FormDataDto formData;
    private Instant submittedAt;
    private Instant reviewStartedAt;
    private Instant reviewedAt;
    private String pdfStoragePath;
    private Instant createdAt;
    private Instant updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCycleId() { return cycleId; }
    public void setCycleId(Long cycleId) { this.cycleId = cycleId; }

    public String getCycleName() { return cycleName; }
    public void setCycleName(String cycleName) { this.cycleName = cycleName; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public Long getManagerId() { return managerId; }
    public void setManagerId(Long managerId) { this.managerId = managerId; }

    public String getManagerName() { return managerName; }
    public void setManagerName(String managerName) { this.managerName = managerName; }

    public Long getBackupReviewerId() { return backupReviewerId; }
    public void setBackupReviewerId(Long backupReviewerId) { this.backupReviewerId = backupReviewerId; }

    public Long getTemplateId() { return templateId; }
    public void setTemplateId(Long templateId) { this.templateId = templateId; }

    public FormStatus getStatus() { return status; }
    public void setStatus(FormStatus status) { this.status = status; }

    public FormDataDto getFormData() { return formData; }
    public void setFormData(FormDataDto formData) { this.formData = formData; }

    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }

    public Instant getReviewStartedAt() { return reviewStartedAt; }
    public void setReviewStartedAt(Instant reviewStartedAt) { this.reviewStartedAt = reviewStartedAt; }

    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getPdfStoragePath() { return pdfStoragePath; }
    public void setPdfStoragePath(String pdfStoragePath) { this.pdfStoragePath = pdfStoragePath; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
