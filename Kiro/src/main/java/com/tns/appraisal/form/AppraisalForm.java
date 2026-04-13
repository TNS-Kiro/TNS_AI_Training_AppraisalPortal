package com.tns.appraisal.form;

import com.tns.appraisal.common.BaseEntity;
import com.tns.appraisal.cycle.AppraisalCycle;
import com.tns.appraisal.template.AppraisalTemplate;
import com.tns.appraisal.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "appraisal_forms",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_form_cycle_employee",
           columnNames = {"cycle_id", "employee_id"}
       ))
public class AppraisalForm extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cycle_id", nullable = false)
    private AppraisalCycle cycle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id", nullable = false)
    private User manager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "backup_reviewer_id")
    private User backupReviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private AppraisalTemplate template;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private FormStatus status = FormStatus.NOT_STARTED;

    @Convert(converter = FormDataConverter.class)
    @Column(name = "form_data", columnDefinition = "NVARCHAR(MAX)")
    private FormData formData;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "review_started_at")
    private Instant reviewStartedAt;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "pdf_storage_path", columnDefinition = "NVARCHAR(500)")
    private String pdfStoragePath;

    public AppraisalForm() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AppraisalCycle getCycle() { return cycle; }
    public void setCycle(AppraisalCycle cycle) { this.cycle = cycle; }

    public User getEmployee() { return employee; }
    public void setEmployee(User employee) { this.employee = employee; }

    public User getManager() { return manager; }
    public void setManager(User manager) { this.manager = manager; }

    public User getBackupReviewer() { return backupReviewer; }
    public void setBackupReviewer(User backupReviewer) { this.backupReviewer = backupReviewer; }

    public AppraisalTemplate getTemplate() { return template; }
    public void setTemplate(AppraisalTemplate template) { this.template = template; }

    public FormStatus getStatus() { return status; }
    public void setStatus(FormStatus status) { this.status = status; }

    public FormData getFormData() { return formData; }
    public void setFormData(FormData formData) { this.formData = formData; }

    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }

    public Instant getReviewStartedAt() { return reviewStartedAt; }
    public void setReviewStartedAt(Instant reviewStartedAt) { this.reviewStartedAt = reviewStartedAt; }

    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getPdfStoragePath() { return pdfStoragePath; }
    public void setPdfStoragePath(String pdfStoragePath) { this.pdfStoragePath = pdfStoragePath; }

    // Convenience ID getters used by FormService, ReviewService, ReviewController
    public Long getCycleId() { return cycle != null ? cycle.getId() : null; }
    public Long getEmployeeId() { return employee != null ? employee.getId() : null; }
    public Long getManagerId() { return manager != null ? manager.getId() : null; }
    public Long getBackupReviewerId() { return backupReviewer != null ? backupReviewer.getId() : null; }
    public Long getTemplateId() { return template != null ? template.getId() : null; }

    // Convenience ID setters for backward compatibility (tests / Phase 3 code)
    public void setCycleId(Long cycleId) {
        if (this.cycle == null) { this.cycle = new AppraisalCycle(); }
        this.cycle.setId(cycleId);
    }

    public void setEmployeeId(Long employeeId) {
        if (this.employee == null) { this.employee = new User(); }
        this.employee.setId(employeeId);
    }

    public void setManagerId(Long managerId) {
        if (this.manager == null) { this.manager = new User(); }
        this.manager.setId(managerId);
    }

    public void setBackupReviewerId(Long backupReviewerId) {
        if (backupReviewerId == null) { this.backupReviewer = null; return; }
        if (this.backupReviewer == null) { this.backupReviewer = new User(); }
        this.backupReviewer.setId(backupReviewerId);
    }

    public void setTemplateId(Long templateId) {
        if (this.template == null) { this.template = new AppraisalTemplate(); }
        this.template.setId(templateId);
    }
}
