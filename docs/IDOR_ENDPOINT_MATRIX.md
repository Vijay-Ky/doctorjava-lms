# IDOR endpoint matrix (ownership / role checks)

Status legend: **OK** = owner/admin or role gate present | **FIXED** = fixed this round | **N/A** = not user-scoped

| Endpoint | Check | Status |
|----------|--------|--------|
| GET `/api/users/{id}` | `getUserByIdSecure` → requireOwnerOrAdmin | OK |
| GET `/api/users/{id}/profile-image` | requireOwnerOrAdmin | FIXED (IDOR-001) |
| PUT `/api/users/{id}` | requireOwnerOrAdmin | OK |
| POST `/api/users/{id}/upload-image` | requireOwnerOrAdmin | OK |
| PATCH `/api/users/{id}/role` | ADMIN + SUPER_ADMIN gate for elevate | OK (GAP-006) |
| GET `/api/assessments/performance/{userId}` | requireOwnerOrAdmin | OK (GAP-003) |
| GET `/api/assessments/user/{userId}/course/{courseId}` | requireOwnerOrAdmin | OK |
| POST `/api/assessments/add/{userId}/{courseId}` | requireOwnerOrAdmin | OK |
| GET `/api/dashboard/user/{userId}` | requireOwnerOrAdmin | OK |
| GET `/api/dashboard/user/me` | principal only | OK |
| GET `/api/progress/...` | resolveUserId + requireOwnerOrAdmin | OK |
| POST `/api/learning` | resolveUserId + price gate | OK (PAY-002) |
| POST `/api/notifications/{id}/read` | owner only (403 else) | FIXED |
| GET `/api/notifications` | principal only | OK |
| Coding attempts `studentKey` | auth.getName() server-side | OK (GAP-001) |
| Mock test answers/submit | findByIdAndStudentKey | OK |
| Assignment submit | principal userId | OK |
| Assignment grade | ADMIN/INSTRUCTOR only | OK |
| Community posts | create as principal; no edit/delete | N/A (missing feature) |
| Leaderboard | public; names via displayName | OK (PII-001) |
| Curriculum mutate | ADMIN/INSTRUCTOR roles | OK |
| Feedback GET by course | public course data | N/A |
| Payment verify/mock | ownership on payment.userId | OK |

**Sweep method:** every `@PathVariable` UUID/Long used to load a user-owned entity must have requireOwnerOrAdmin, studentKey match, or role restriction before use.
