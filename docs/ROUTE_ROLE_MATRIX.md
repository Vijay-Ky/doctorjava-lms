# GAP-011 — SecurityConfig route → role matrix

**Source of truth:** `backend/src/main/java/com/doctorjava/lms/config/SecurityConfig.java`  
**Method security:** `@EnableMethodSecurity` — some controllers add `@PreAuthorize` on top of this filter chain.

Rules are evaluated **in declaration order**. First match wins.

| # | Method | Pattern | Required access |
|---|--------|---------|-----------------|
| 1 | OPTIONS | `/**` | permitAll |
| 2 | POST | `/api/auth/login`, `/api/auth/register` | permitAll |
| 3 | GET | `/api/auth/session` | permitAll |
| 4 | * | `/api/auth/**`, `/oauth2/**`, `/login/oauth2/**`, `/swagger-ui/**`, `/v3/api-docs/**`, `/actuator/health`, `/error` | permitAll |
| 5 | GET | `/api/courses/**` | permitAll |
| 6 | GET | `/api/curriculum/course/**` | permitAll |
| 7 | GET | `/api/curriculum/**` | authenticated |
| 8 | * | `/api/curriculum/**` | ADMIN, SUPER_ADMIN, INSTRUCTOR |
| 9 | GET | `/api/v1/practice/tests`, `.../tests/**`, `.../mcq/**`, `.../coding-tests`, `.../coding-tests/**` | permitAll |
| 10 | * | `/api/v1/practice/**` | authenticated |
| 11 | GET | `/api/v1/catalog/**` | permitAll |
| 12 | POST | `/api/payments/webhook/**` | permitAll |
| 13 | * | `/api/v1/admin/**` | ADMIN, SUPER_ADMIN |
| 14 | POST/PUT/DELETE | `/api/courses/**` | ADMIN, SUPER_ADMIN |
| 15 | * | `/api/assessments/**`, `/api/learning/**`, `/api/progress/**`, `/api/questions/**`, `/api/discussions/**`, `/api/feedbacks/**` | USER, ADMIN, SUPER_ADMIN, INSTRUCTOR |
| 16 | * | `/api/dashboard/admin/**` | ADMIN, SUPER_ADMIN |
| 17 | * | `/api/dashboard/**` | USER, ADMIN, SUPER_ADMIN, INSTRUCTOR |
| 18 | * | `/api/notifications/**` | USER, ADMIN, SUPER_ADMIN, INSTRUCTOR |
| 19 | * | `/api/assignments/**` | USER, ADMIN, SUPER_ADMIN, INSTRUCTOR |
| 20 | GET | `/api/community/**` | permitAll |
| 21 | * | `/api/community/**` | authenticated |
| 22 | * | `/api/instructor/**` | INSTRUCTOR, ADMIN, SUPER_ADMIN |
| 23 | * | `/api/admin/analytics/**` | ADMIN, SUPER_ADMIN, INSTRUCTOR |
| 24 | * | `/api/leaderboard/**` | permitAll |
| 25 | * | `/api/admin/**` | ADMIN, SUPER_ADMIN |
| 26 | * | `/api/payments/**` | USER, ADMIN, SUPER_ADMIN |
| 27 | GET | `/api/users/details`, `/api/users/{id}`, `/api/users/{id}/profile-image` | authenticated |
| 28 | PUT | `/api/users/{id}` | authenticated |
| 29 | POST | `/api/users/{id}/upload-image` | authenticated |
| 30 | * | `/api/users/**` | ADMIN, SUPER_ADMIN |
| 31 | * | any other | authenticated |

## Notable method-level extras

| Location | Extra rule |
|----------|------------|
| `UserController` | `@PreAuthorize` ADMIN/SUPER_ADMIN on list, admin-create, role patch |
| Role assignment | Only SUPER_ADMIN may assign ADMIN/SUPER_ADMIN (GAP-006) |
| `AssignmentController` | Grade/list submissions: ADMIN, SUPER_ADMIN, INSTRUCTOR |
| `BulkMcqImportController` | Class-level `@PreAuthorize` ADMIN, SUPER_ADMIN |

## PR checklist (drift guard)

Any PR that edits `SecurityConfig.securityFilterChain()` **must** also update:

1. This file (`docs/ROUTE_ROLE_MATRIX.md`)
2. `FullRouteRoleMatrixTest.java` case table

## Automated coverage

`FullRouteRoleMatrixTest` probes **unauthenticated** callers:

- PUBLIC rows → must **not** be 401
- PROTECTED rows → must be **401**

Run: `./mvnw test -Dtest=FullRouteRoleMatrixTest`

## Automated tests (JWT role-positive)

`FullRouteRoleMatrixTest` now includes:

1. **Anonymous matrix** — PUBLIC ≠ 401, PROTECTED = 401  
2. **JWT role matrix** — seeds four users (`matrix-user@test.local`, `matrix-instructor@test.local`, `matrix-admin@test.local`, `matrix-super@test.local`) and issues real HS256 JWTs via `JwtUtils`.

| Actor | Sample ALLOW | Sample DENY |
|-------|--------------|-------------|
| USER | payments, learning, community write, practice attempts | `/api/v1/admin/**`, create course, users list, instructor |
| INSTRUCTOR | `/api/instructor/**`, admin analytics, curriculum write | `/api/v1/admin/**`, create course, users list |
| ADMIN | v1 admin, courses write, users list, admin dashboard | (none in sample — broad admin) |
| SUPER_ADMIN | same admin surface | — |

**ALLOW** means status is not 401/403 (business 400/404/500 still count as “past the security filter”).  
**DENY** means 401 or 403.

```bash
./mvnw test -Dtest=FullRouteRoleMatrixTest
```
