# Social login, Bulk MCQ import, Course builder

## Social login (Google / Facebook)

Backend already wires Spring OAuth2 (`OAuth2LoginSuccessHandler`, `application-oauth.yml`).

1. Create OAuth apps:
   - Google Cloud Console → OAuth client (Web) → authorized redirect:
     `http://localhost:8080/login/oauth2/code/google`
   - Facebook Developer → Facebook Login → Valid OAuth Redirect:
     `http://localhost:8080/login/oauth2/code/facebook`

2. Env / profile:
```bash
export GOOGLE_CLIENT_ID=...
export GOOGLE_CLIENT_SECRET=...
export FACEBOOK_CLIENT_ID=...
export FACEBOOK_CLIENT_SECRET=...
export SPRING_PROFILES_ACTIVE=local,oauth
```

3. Frontend: Login & Register show **Continue with Google / Facebook** →
   `{API}/oauth2/authorization/{provider}` → cookie JWT → `/auth/callback`.

## Bulk MCQ import

Admin → **Bulk MCQ import** (`/admin/mcq-import`)

- Paste or upload `.txt` in assignment format (`**Question N:**`, `a)`…`d)`, `**Answer: c)**`, `Explanation:`).
- Set **Subject ID** (usually `1` after seed) and **Topic name** (auto-created).
- API: `POST /api/v1/admin/mcq-import` (multipart).

Questions appear in Topic MCQ practice when **Published**.

## Udemy-style course builder

1. Admin → **Courses** — name, price, level, thumbnail, promo YouTube, learnings, requirements.
2. **Curriculum** on each course — sections + lectures:
   - Content types: VIDEO, PDF, AUDIO, TEXT, DOWNLOAD, LIVE_CLASS, ASSIGNMENT
   - Preview flag (free sample)
   - Unlock rules (immediate / scheduled / after previous)
3. Student course page shows curriculum; locked lectures require enrollment.

Flyway `V19__course_udemy_fields.sql` adds metadata columns.
