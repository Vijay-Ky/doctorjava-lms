# HackerRank-style Coding Assessment Module

Additive module that runs alongside existing MCQ mock tests. Students write **Java** in the browser, **Run** against sample cases, **Submit** against hidden cases, and finish the timed test for an overall score.

## Assumptions (review before merge)

| Topic | Choice |
|--------|--------|
| Languages | **Java only** for v1 (`allowedLanguages = JAVA`). Piston mapping also has PYTHON3 / JS / CPP ready. |
| Piston Java version | `15.0.2` (install via `piston-cli ppman install java=15.0.2`) |
| Partial credit | If `partialCreditAllowed`, marks = question.marks × (passed / total). Else all-or-nothing. |
| Run vs Submit | **Run** = samples only, does not count toward score. **Submit** = all cases, graded; best final submission per question is used on Finish. |
| Execution | Never on the app JVM — always via **Piston** HTTP API. |
| Hidden data | Reference solutions and non-sample expected outputs are never sent to the student UI on Submit results (pass/fail only for hidden). |

## Start Piston (required for Run/Submit)

```bash
cd doctor-java-lms-final
docker compose up -d piston

# One-time: install Java runtime into Piston
docker exec -it doctor-java-piston piston-cli ppman install java=15.0.2
```

App property: `app.piston.url` (default `http://localhost:2000`), override with `PISTON_URL`.

## Schema

Flyway: `V18__coding_assessment.sql`

- `coding_questions`, templates, test cases  
- `mock_tests.test_type` = `MCQ` \| `CODING`  
- `mock_test_coding_questions`  
- Snapshot attempt tables + `code_submissions` / results  

Existing MCQ tables are untouched.

## APIs

**Student** (`/api/v1/practice/...`, authenticated except list):

- `GET  /coding-tests`
- `POST /coding-tests/{id}/attempts`
- `GET  /coding-attempts/{attemptId}/questions/{questionId}`
- `POST .../run` · `POST .../submit`
- `GET  /coding-submissions/{id}`
- `POST /coding-attempts/{attemptId}/finish`

**Admin** (`/api/v1/admin/...`):

- CRUD `/coding-questions` + `POST /{id}/validate?language=JAVA`
- CRUD `/coding-tests`

## Frontend routes

- `/coding-tests` — list & start  
- `/coding-assessment/[attemptId]` — Monaco split-pane runner  
- `/admin/coding-questions`, `/admin/coding-questions/new`  
- `/admin/coding-tests`  

Nav: **Coding** link. Admin hub links to coding question bank and tests.

## Quick admin flow

1. Create a **coding question** (statement, sample + hidden cases, Java starter + optional reference).  
2. Optionally `POST .../validate` with reference solution.  
3. Create a **coding test** with published question IDs.  
4. Student opens **Coding** → Start → Run / Submit → Finish.

## Security notes

- Sandbox only via Piston container (`privileged` required by Piston).  
- Rate-limit Run/Submit in a later iteration if abuse appears (Bucket4j is already on the classpath).  
- Enforce overall `durationMinutes` on the attempt (`expiresAt`).
