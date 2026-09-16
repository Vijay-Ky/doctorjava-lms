## Local login (after this build)

Backend profile: `local` (default).

| Account | Email | Password |
|---------|--------|----------|
| Super admin | `admin@doctorjava.tech` | `admin` |
| Learner | `vijayky007@gmail.com` | `vijay` |

Admin UI: sign in then open `/admin`.

If login previously failed with `WeakKeyException` / HS512, rebuild the backend so `JwtUtils` uses **HS256**.
