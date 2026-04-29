# Feature Specification: Appraisal Portal Specification

**Feature Branch**: `001-appraisal-portal-spec`  
**Created**: April 29, 2026  
**Status**: Draft  
**Input**: User description: "Generate specification for existing Angular 21 + Spring Boot appraisal portal system for both frontend and backend"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Employee Submits Self-Appraisal (Priority: P1)

As an employee, I want to complete and submit my self-appraisal form so that my performance can be reviewed by my manager.

**Why this priority**: This is the core functionality that enables the appraisal process for employees.

**Independent Test**: Can be tested by an employee logging in, filling out the form, saving drafts, and submitting, verifying the form status changes and notifications are sent.

**Acceptance Scenarios**:

1. **Given** an employee is assigned to an active appraisal cycle, **When** they access their appraisal form, **Then** they see a dynamic form based on the template.
2. **Given** an employee is filling the form, **When** they save as draft, **Then** the form data is persisted and status remains DRAFT_SAVED.
3. **Given** a draft form, **When** the employee submits it, **Then** the status changes to SUBMITTED and the manager is notified.

---

### User Story 2 - Manager Reviews Appraisal (Priority: P1)

As a manager, I want to review my team's appraisal forms so that I can provide feedback and ratings.

**Why this priority**: This completes the appraisal workflow by allowing managerial oversight.

**Independent Test**: Can be tested by a manager starting a review, saving drafts, and completing the review, verifying ratings are saved and PDF is generated.

**Acceptance Scenarios**:

1. **Given** a submitted appraisal, **When** the manager starts review, **Then** status changes to UNDER_REVIEW.
2. **Given** under review, **When** manager saves review draft, **Then** data is persisted without completing.
3. **Given** review draft, **When** manager completes review, **Then** status becomes REVIEWED_AND_COMPLETED, PDF is generated, and notifications sent.

---

### User Story 3 - HR Manages Appraisal Cycles (Priority: P2)

As HR, I want to create and manage appraisal cycles so that the organization can conduct periodic performance reviews.

**Why this priority**: This enables the setup and administration of the appraisal process.

**Independent Test**: Can be tested by HR creating a cycle, triggering it, and verifying forms are generated for employees.

**Acceptance Scenarios**:

1. **Given** HR access, **When** they create a cycle with dates and template, **Then** the cycle is saved in DRAFT status.
2. **Given** a draft cycle, **When** HR activates it, **Then** status becomes ACTIVE.
3. **Given** active cycle, **When** HR triggers it, **Then** appraisal forms are generated for selected employees.

---

### User Story 4 - HR Assigns Backup Reviewers (Priority: P3)

As HR, I want to assign backup reviewers to ensure continuity in the review process.

**Why this priority**: Provides redundancy for the review workflow.

**Independent Test**: Can be tested by HR assigning backup, then verifying the backup can review if primary is unavailable.

**Acceptance Scenarios**:

1. **Given** an employee, **When** HR assigns a backup reviewer, **Then** the assignment is saved.
2. **Given** backup assigned, **When** primary manager is unavailable, **Then** backup can access and review the form.

### Edge Cases

- What happens when an appraisal cycle ends before all forms are submitted? (Forms remain in current status, HR can reopen if needed)
- How does system handle when a manager changes during a cycle? (HR can update reporting hierarchy, forms remain assigned to original manager unless reopened)
- What if an employee tries to submit after deadline? (System allows submission, but cycle status may be COMPLETED)
- How to handle concurrent edits? (Last save wins, audit log tracks changes)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow employees to view and complete dynamic appraisal forms based on JSON templates.
- **FR-002**: System MUST support draft saving for employee forms to prevent data loss.
- **FR-003**: System MUST enable form submission by employees, changing status to SUBMITTED.
- **FR-004**: System MUST notify managers when forms are submitted.
- **FR-005**: System MUST allow managers to start, save drafts, and complete reviews of employee appraisals.
- **FR-006**: System MUST generate PDF documents upon review completion.
- **FR-007**: System MUST send email notifications to employees, managers, and HR on key events.
- **FR-008**: System MUST provide role-based dashboards showing relevant appraisal statuses.
- **FR-009**: System MUST allow HR to create, activate, and trigger appraisal cycles.
- **FR-010**: System MUST support assignment of backup reviewers for continuity.
- **FR-011**: System MUST maintain comprehensive audit logs of all actions.
- **FR-012**: System MUST enforce session-based authentication with 15-minute timeout.
- **FR-013**: System MUST support historical form tracking and template versioning.
- **FR-014**: System MUST allow HR to reopen completed forms for corrections.

### Key Entities *(include if feature involves data)*

- **AppraisalCycle**: Represents a period for performance reviews, with start/end dates, template, and status.
- **AppraisalForm**: The main form entity with status, form data, timestamps, and relationships to user and cycle.
- **User**: Employee/manager/HR with roles, reporting hierarchy.
- **AppraisalTemplate**: JSON schema for form structure, versioned.
- **AuditLog**: Tracks all system actions with user, action, entity details.
- **Notification**: Templates and logs for email alerts.

## Success Criteria

- Users can complete the full appraisal workflow (submission to review completion) in under 10 minutes per form.
- System supports 1000 concurrent users during peak appraisal periods.
- 99% of forms are submitted without data loss (draft saves).
- All notifications are delivered within 5 minutes of events.
- Audit logs capture 100% of user actions.
- PDF generation completes within 30 seconds of review completion.

## Assumptions

- Angular 21 and Spring Boot 3.4.1 are the supported versions.
- MS SQL Server 2019+ is the database.
- Email service is configured for notifications.
- File system has write access for PDF storage.

## Dependencies

- External: Email service for notifications.
- Internal: Database connectivity, file system access.