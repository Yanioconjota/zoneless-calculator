# Create Docs for Frontend Prompt

Generate Angular frontend integration docs from backend code.

## Usage

```
/create-docs [path to backend or describe API]
```

## Process

1. **Analyze backend** - Find controllers, routes, models, auth
2. **Extract endpoints** - Method, path, request/response types
3. **Generate interfaces** - TypeScript types from DTOs
4. **Document patterns** - Auth, pagination, errors

## Output Structure

```markdown
# Frontend Integration: [Project]

## API Base
- **URL:** `http://localhost:PORT`
- **Base Path:** `/api/v1`

## Authentication
- **Type:** JWT Bearer
- **Header:** `Authorization: Bearer <token>`
- **Login:** `POST /api/auth/login`

## Endpoints

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | /api/users | ✓ | - | User[] |
| POST | /api/users | ✓ | CreateUserDto | User |

## TypeScript Interfaces

```typescript
interface User {
  id: string;
  email: string;
  name: string;
}

interface CreateUserDto {
  email: string;
  password: string;
}
```

## Error Format

```typescript
interface ApiError {
  statusCode: number;
  message: string;
}
```

## Frontend Checklist

- [ ] Configure HTTP client with interceptors
- [ ] Implement auth service
- [ ] Create Signal Store per feature
- [ ] Build API services
```

## Framework Detection

| Framework | Routes | Models |
|-----------|--------|--------|
| Express | `routes/*.js` | `models/*.js` |
| NestJS | `*.controller.ts` | `*.dto.ts` |
| FastAPI | `routers/*.py` | `schemas/*.py` |

## Output Location

Save to: `docs/frontend-integration-prompt.md`
