# Commit Message Guidelines

All commit messages in this repository must follow the conventions below. These rules are enforced on every commit — Claude Code must read this file before writing any commit message.

---

## Format

```
<type>(<scope>): <short summary>

<body — required, must bring the total message length above 200 characters>

<footer — optional: breaking changes, issue refs>
```

- **type** and **scope** are lowercase.
- **Short summary**: imperative mood, no period at the end, max 72 chars.
- **Body**: explain *why* the change was made, not just *what*. Must be present and detailed enough that the total commit message (header + body) exceeds **200 characters**.

---

## Types

| Type       | When to use |
|------------|-------------|
| `feat`     | A new feature or capability visible to the user or API consumer |
| `fix`      | A bug fix |
| `chore`    | Maintenance tasks: dependency updates, config changes, tooling, CI tweaks |
| `refactor` | Code restructuring that neither fixes a bug nor adds a feature |
| `perf`     | A change that improves performance |
| `test`     | Adding or updating tests with no production code change |
| `docs`     | Documentation only changes (README, inline comments, specs) |
| `style`    | Formatting, whitespace, missing semicolons — no logic change |
| `build`    | Changes to the build system, Docker, docker-compose, Makefile |
| `ci`       | Changes to CI/CD pipeline configuration |
| `rfe`      | Request For Enhancement — exploratory or partial work toward a larger feature |
| `revert`   | Reverts a previous commit |

---

## Scopes (examples)

Use the area of the codebase affected:

- `backend`, `frontend`, `db`, `infra`, `api`, `auth`, `seed`, `tests`, `router`, `service`, `schema`, `model`, `dashboard`, `requests`, `technicians`

---

## Rules

1. **Body is mandatory.** One-liner commits are not allowed. Describe the motivation and context.
2. **Total length > 200 characters.** The combined header + body must exceed 200 characters. This ensures enough context is captured for future readers.
3. **One logical change per commit.** Do not bundle unrelated changes.
4. **Present tense, imperative mood** in the summary: "add endpoint" not "added endpoint" or "adds endpoint".
5. **No vague messages** like "fix stuff", "WIP", "changes", "update". Be specific.
6. **No AI attribution.** Do not include `Co-Authored-By`, `Generated with`, or any other AI tool attribution in commit messages.

---

## Examples

```
feat(api): add paginated list endpoint for service requests

Implements GET /api/v1/service-requests with support for status, priority,
technician_id, and search filters. Pagination is handled via page/page_size
query params. TanStack Query key includes all active filters so cache stays
consistent across filter changes.
```

```
chore(backend): set up uv project with FastAPI and async dependencies

Initializes pyproject.toml using uv as the package manager. Pins FastAPI,
uvicorn, SQLAlchemy 2.x async, asyncpg, alembic, pydantic v2, and
pydantic-settings. Dev dependencies include pytest, pytest-asyncio, and httpx
for async test coverage.
```

```
fix(service): enforce status transition rules in service layer

Previously the status field could be set to any value via PATCH. Now all
status changes must go through the transition validator which raises
HTTPException(400) with a descriptive message when the transition is not
in the allowed set (e.g. COMPLETED → IN_PROGRESS).
```

```
refactor(schema): split technician and service_request schemas into own files

Moved all Pydantic v2 schemas out of a single schemas.py into per-resource
files under app/schemas/. This matches the models/ and routers/ layout and
makes it easier to locate and update response shapes without touching
unrelated resources.
```
