package com.tns.appraisal.audit;

import java.time.Instant;

/**
 * Response DTO for audit log entries, enriched with user name.
 */
public class AuditLogResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String action;
    private String entityType;
    private Long entityId;
    private String details;
    private String ipAddress;
    private Instant createdAt;

    public AuditLogResponse() {}

    public AuditLogResponse(AuditLog log, String userName) {
        this.id = log.getId();
        this.userId = log.getUserId();
        this.userName = userName;
        this.action = log.getAction();
        this.entityType = log.getEntityType();
        this.entityId = log.getEntityId();
        this.details = log.getDetails();
        this.ipAddress = log.getIpAddress();
        this.createdAt = log.getCreatedAt();
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getAction() { return action; }
    public String getEntityType() { return entityType; }
    public Long getEntityId() { return entityId; }
    public String getDetails() { return details; }
    public String getIpAddress() { return ipAddress; }
    public Instant getCreatedAt() { return createdAt; }
}
