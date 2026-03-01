# FastFeet API — Project Rules

## Overview

RESTful API for a shipping company. NestJS + Clean Architecture. Manages users (admins/couriers), recipients, and orders through a delivery lifecycle: **PENDING → WAITING → WITHDRAWN → DELIVERED → RETURNED**.

## Commands

| Task             | Command                                                             |
| ---------------- | ------------------------------------------------------------------- |
| Dev server       | `npm run start:dev`                                                 |
| Build            | `npm run build`                                                     |
| Lint (auto-fix)  | `npm run lint`                                                      |
| Format           | `npm run format`                                                    |
| Typecheck        | `npm run typecheck`                                                 |
| Unit tests       | `npm test`                                                          |
| Single unit test | `npx vitest path/to/file.spec.ts`                                   |
| E2E tests        | `npm run test:e2e`                                                  |
| Single E2E test  | `npx vitest --config vitest.config.e2e.ts path/to/file.e2e-spec.ts` |
| Run migrations   | `npx prisma migrate dev`                                            |
| Seed admin user  | `npx prisma db seed`                                                |
| Start databases  | `docker compose up -d`                                              |

E2E tests require the test database running (`docker compose up -d`).

## Architecture

### Clean Architecture Layers

```
src/core/      → Pure business logic, no framework dependencies
src/infra/     → NestJS controllers, Prisma repos, external services
src/test/      → Test doubles (in-memory repos, fakes, factories)
src/generated/ → Auto-generated Prisma client (do not edit)
```

**Dependency rule**: `core/` never imports from `infra/`. Core defines abstract interfaces; infra provides implementations via NestJS DI.

### Core Layer

- **Use-cases**: One `@Injectable()` class per feature. Returns `Either<Error, Success>`, never throws.
- **Repositories**: Abstract classes defining data access contracts. Implemented in infra via Prisma.
- **Either monad**: `Left` = failure, `Right` = success. Use `left()` / `right()` helpers.
- **Error types**: Each business error implements `UseCaseError`. Controllers map these to HTTP exceptions.
- **Abstract services**: Cryptography (`Encrypter`, `HashGenerator`, `HashComparer`, `TokenHasher`), messaging (`Mailer`), storage (`Uploader`).

### Infrastructure Layer

- **Controllers**: Zod schemas + `ZodValidationPipe` for request validation. Map `Either` results to HTTP exceptions.
- **Presenters**: Static `toHTTP()` methods that transform domain objects to API responses (strip sensitive fields).
- **Auth**: JWT (HS256) with Passport. Global guards: `JwtAuthGuard` + `RolesGuard`. Decorators: `@Public()`, `@Roles()`, `@CurrentUser()`.
- **DI wiring**: `{ provide: AbstractClass, useClass: ConcreteClass }` in module providers.
- **Environment**: Zod schema validates all env vars at startup. Access via `EnvService.get('KEY')`.

## Key Conventions

- **Path alias**: `@/*` → `./src/*`
- **ESM**: `"type": "module"` — local infra imports may require `.js` extension
- **Prisma models as entities**: Uses Prisma-generated types directly, no separate domain entity classes
- **Refresh tokens**: SHA-256 hashed before storage. Token family tracking detects reuse.

## Testing Patterns

- **Unit tests** (`*.spec.ts`): In-memory repositories + fake services. No database. Convention: `sut` variable for System Under Test.
- **E2E tests** (`*.e2e-spec.ts`): Real NestJS app against test DB. Isolated PostgreSQL schema per run (UUID-based), auto-dropped after tests.
- **Test factories** in `src/test/factories/`: Helper functions for quickly creating test data.
- **Fake implementations** in `src/test/`: Deterministic substitutes for crypto, mailer, uploader, etc.
