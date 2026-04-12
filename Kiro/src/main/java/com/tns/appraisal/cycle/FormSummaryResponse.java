package com.tns.appraisal.cycle;

import com.tns.appraisal.form.AppraisalForm;

import java.time.Instant;

/**
 * Response DTO for appraisal form summary in cycle details view.
 * Enriches the raw form entity with employee/manager names.
 */
public class FormSummaryResponse {

    private Long id;
    private Long cycleId;
    private Long employeeId;
    private String employeeName;
    private Long managerId;
    private String managerName;
    private Long backupReviewerId;
    private String backupReviewerName;
    private Long templateId;
    private String status;
    private Instant submittedAt;
    private Instant reviewStartedAt;
    private Instant reviewedAt;
    private String pdfStoragePath;

    public FormSummaryResponse() {}

    public FormSummaryResponse(AppraisalForm form,
                               String employeeName,
                               String managerName,
                               String backupReviewerName) {
        this.id = form.getId();
        this.cycleId = form.getCycleId();
        this.employeeId = form.getEmployeeId();
        this.employeeName = employeeName;
        this.managerId = form.getManagerId();
        this.managerName = managerName;
        this.backupReviewerId = form.getBackupReviewerId();
        this.backupReviewerName = backupReviewerName;
        this.templateId = form.getTemplateId();
        this.status = form.getStatus();
        this.submittedAt = form.getSubmittedAt();
        this.reviewStartedAt = form.getReviewStartedAt();
        this.reviewedAt = form.getReviewedAt();
        this.pdfStoragePath = form.getPdfStoragePath();
    }

    public Long getId() { return id; }
    public Long getCycleId() { return cycleId; }
    public Long getEmployeeId() { return employeeId; }
    public String getEmployeeName() { return employeeName; }
    public Long getManagerId() { return managerId; }
    public String getManagerName() { return managerName; }
    public Long getBackupReviewerId() { return backupReviewerId; }
    public String getBackupReviewerName() { return backupReviewerName; }
    public Long getTemplateId() { return templateId; }
    public String getStatus() { return status; }
    public Instant getSubmittedAt() { return submittedAt; }
    public Instant getReviewStartedAt() { return reviewStartedAt; }
    public Instant getReviewedAt() { return reviewedAt; }
    public String getPdfStoragePath() { return pdfStoragePath; }
}
