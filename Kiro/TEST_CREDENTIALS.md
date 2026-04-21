# Test User Credentials

> **Environment:** Development (`http://localhost:4200`)  
> **All passwords:** `password`

---

## Admin

| Field | Value |
|---|---|
| Employee ID | `EMP001` |
| Full Name | System Administrator |
| Email | admin@tns.com |
| Password | `password` |
| Role | ADMIN |
| Department | IT |
| Login redirects to | `/admin/users` |

---

## HR

| Field | Value |
|---|---|
| Employee ID | `EMP002` |
| Full Name | HR Manager |
| Email | hr@tns.com |
| Password | `password` |
| Role | HR |
| Department | Human Resources |
| Login redirects to | `/hr/cycles` |

---

## Managers

| Employee ID | Full Name | Email | Password | Department | Redirects to |
|---|---|---|---|---|---|
| `EMP003` | John Manager | john.manager@tns.com | `password` | Engineering | `/manager` |
| `EMP007` | Sarah Manager | sarah.manager@tns.com | `password` | Sales | `/manager` |

---

## Employees

| Employee ID | Full Name | Email | Password | Department | Manager |
|---|---|---|---|---|---|
| `EMP004` | Amit Shingankar K | amitkumars@thinknsolutions.com | `password` | Engineering | John Manager |
| `EMP005` | Bob Jones | bob.jones@tns.com | `password` | Engineering | Sarah Manager |
| `EMP006` | Alice Brown | alice.brown@tns.com | `password` | Sales | Sarah Manager |
| `EMP2002` | HP | hp@tns.com | `password` | IT | — |
| `EMP20021` | Lokesh | lokesh@tns.com | `password` | IT | — |

---

## Inactive Users

| Employee ID | Full Name | Email | Status |
|---|---|---|---|
| `EMP2003` | MuthuKumar S | Muthu@tns.com | Inactive (cannot login) |

---

## Notes

- Login using **Employee ID** (e.g. `EMP001`) or **email** in the login identifier field
- All accounts share the same password: `password`
- After login, each role is redirected to its own dashboard automatically
- Inactive users cannot authenticate
r