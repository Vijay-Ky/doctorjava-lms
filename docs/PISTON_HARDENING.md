# DOCKER-001 — Piston sandbox hardening

## Changes in docker-compose.yml

- `privileged: true` **removed** (commented with restore note)
- Port bound to `127.0.0.1:2000` only (not all interfaces)
- `security_opt: no-new-privileges:true`
- `cap_drop: ALL` + minimal `cap_add` for package install / runtime
- `tmpfs` for `/tmp`

## Live verification (run on a machine with Docker)

```bash
docker compose up -d piston
docker exec -it doctor-java-piston piston-cli ppman install java=15.0.2

# From the LMS app (local profile), Run a Java coding question.
# Or curl Piston:
curl -s http://127.0.0.1:2000/api/v2/runtimes | head

curl -s -X POST http://127.0.0.1:2000/api/v2/execute \
  -H 'Content-Type: application/json' \
  -d '{"language":"java","version":"15.0.2","files":[{"content":"public class Main{public static void main(String[]a){System.out.println(42);}}"}]}'
```

If execute fails without privileged mode, document the exact error, temporarily set `privileged: true` only for diagnosis, then prefer a capability set that works without full privilege.

## App config

Backend should call `http://127.0.0.1:2000` (or `http://piston:2000` if backend is also in Compose).
