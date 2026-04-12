# Test Scenarios — Phase 1 & Phase 2

## Environment
- Frontend: http://localhost:4200
- Backend: http://localhost:8080 (dev profile → SQL Server)
- Test user: HR role (loginIdentifier + password from seed data)

---

## Phase 1 — Authentication & User Management

### TC-01: Login page loads
- Navigate to http://localhost:4200
- Expected: Redirects to /login, shows TNS Appraisal Portal login form

### TC-02: Login with valid HR credentials
- Enter valid HR email/employeeId + password → click Sign In
- Expected: Redirects to /hr/templates, sidebar visible with Templates + Cycle Management

### TC-03: Login with invalid credentials
- Enter wrong password → click Sign In
- Expected: Error message shown, stays on login page

### TC-04: HR shell layout visible after login
- After login as HR
- Expected: Left sidebar (dark blue) with "Templates" and "Cycle Management" links, top toolbar with user name

### TC-05: Sidebar navigation — Templates active
- On /hr/templates
- Expected: "Templates" nav item highlighted in sidebar

### TC-06: Sidebar navigation — switch to Cycles
- Click "Cycle Management" in sidebar
- Expected: Navigates to /hr/cycles, "Cycle Management" highlighted

### TC-07: Logout
- Click user name in toolbar → Logout
- Expected: Redirects to /login, session cleared

---

## Phase 2 — Template Management

### TC-08: Template list loads
- Navigate to /hr/templates
- Expected: Table showing template versions, active status, created date

### TC-09: Template list shows active template
- Expected: Template v3.0 shown with "Active" chip

### TC-10: View template details
- Click view button on a template
- Expected: Navigates to /hr/templates/:id, shows JSON schema

### TC-11: Activate template
- Click activate on an inactive template → confirm dialog
- Expected: Template becomes active, others deactivated, snackbar success

### TC-12: Deactivate template
- Click deactivate on active template → confirm dialog
- Expected: Template deactivated, snackbar success

---

## Phase 2 — Cycle Management

### TC-13: Cycle dashboard loads
- Navigate to /hr/cycles
- Expected: Cycle list table, "Create Cycle" button visible

### TC-14: Create new cycle
- Click "Create Cycle" → fill name, start date, end date, select template → Submit
- Expected: Cycle created, redirects to /hr/cycles, new cycle in list

### TC-15: Create cycle — validation
- Submit empty form
- Expected: Validation errors shown on all required fields

### TC-16: Create cycle — date validation
- Set end date before start date
- Expected: "End date must be after start date" error

### TC-17: View cycle details
- Click on a cycle in the list
- Expected: Navigates to /hr/cycles/:id, shows cycle info and forms table

### TC-18: Trigger cycle — employee selection
- From cycle details, click Trigger → /hr/cycles/:id/trigger
- Expected: Employee list with checkboxes, search box

### TC-19: Trigger cycle — select all and confirm
- Select all employees → click Trigger → confirmation dialog → confirm
- Expected: Trigger result shown (success/failure counts), redirects to /hr/cycles

### TC-20: Reopen form
- From cycle details, click Reopen on a SUBMITTED form → confirm dialog
- Expected: Form status resets to DRAFT_SAVED, snackbar success

### TC-21: Assign backup reviewer
- From cycle details, click Assign Backup Reviewer → select a manager/HR user → confirm
- Expected: Backup reviewer assigned, snackbar success

---

## Phase 1 — Admin User Management

### TC-22: User management dashboard loads (Admin)
- Login as Admin → navigate to /admin/users
- Expected: User list table with search/filter

### TC-23: Create user
- Click "Add User" → fill form → submit
- Expected: User created, appears in list

### TC-24: Edit user
- Click edit on a user → modify fields → save
- Expected: User updated

### TC-25: Assign role to user
- Click role assignment → select role → save
- Expected: Role assigned, reflected in user list

### TC-26: Audit log viewer
- Navigate to /admin/audit
- Expected: Audit log table with action, user, timestamp columns

---

## Known Issues to Fix (pre-test)
1. `AuthService.sessionWarning$` missing → build error
2. `AuthService.refreshSession()` missing → build error
3. Auth interceptor disabled — 401 responses don't redirect to login
4. `app.config.ts` — auth interceptor not wired
5. Login component uses `loginIdentifier` but `LoginRequest` model has `email`
