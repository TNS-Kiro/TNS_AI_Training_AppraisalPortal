package com.tns.appraisal.notification;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notification_templates")
public class NotificationTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trigger_event", nullable = false, unique = true, length = 100)
    private String triggerEvent;

    @Column(name = "subject", nullable = false, length = 500)
    private String subject;

    @Column(name = "body_html", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String body;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "updated_by")
    private Long updatedBy;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public NotificationTemplate() {}

    public NotificationTemplate(String triggerEvent, String subject, String body) {
        this.triggerEvent = triggerEvent;
        this.subject = subject;
        this.body = body;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTriggerEvent() { return triggerEvent; }
    public void setTriggerEvent(String triggerEvent) { this.triggerEvent = triggerEvent; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public Instant getUpdatedAt() { return updatedAt; }
    public Long getUpdatedBy() { return updatedBy; }
}
