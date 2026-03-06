# FastFeet API — Project Rules

## Overview

RESTful API for a shipping company. NestJS + Clean Architecture. Manages users (admins/couriers), recipients, and orders through a delivery lifecycle: **PENDING → WAITING → WITHDRAWN → DELIVERED → RETURNED**.

Full product requirements (features, business rules, checklist) are documented in [`docs/PRD.md`](docs/PRD.md).

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
src/domain/entities/      → Domain interfaces, input DTOs, const enums
src/domain/repositories/  → Abstract data access contracts (import types from entities)
src/domain/use-cases/     → One @Injectable() class per feature, returns Either<Error, Success>
src/domain/errors/        → Business error types
src/domain/cryptography/  → Abstract crypto services
src/domain/messaging/     → Abstract messaging services (Mailer)
src/domain/storage/       → Abstract storage services (Uploader)
src/infra/              → NestJS controllers, Prisma repos, external services
src/test/               → Test doubles (in-memory repos, fakes, factories)
src/generated/          → Auto-generated Prisma client (do not edit)
```

**Dependency rule**: `domain/` never imports from `infra/` or `generated/`. Domain defines its own entity interfaces and const enums; Prisma types stay in the infra layer.

### Domain Layer

- **Entities**: Domain interfaces and input DTOs live in `src/domain/entities/`. Const objects with `as const` for enums (`Role`, `OrderStatus`, `NotificationStatus`). Repositories import types from here — they never define their own.
- **Repositories**: Abstract classes defining data access contracts. Pure method signatures, no type definitions. Implemented in infra via Prisma.
- **Use-cases**: Returns `Either<Error, Success>`, never throws.
- **Either monad**: `Left` = failure, `Right` = success. Use `left()` / `right()` helpers.
- **Error types**: Each business error implements `UseCaseError`. Controllers map these to HTTP exceptions.
- **Abstract services**: Cryptography (`Encrypter`, `HashGenerator`, `HashComparer`, `TokenHasher`), messaging (`Mailer`), storage (`Uploader`).

### Infrastructure Layer

- **Controllers**: Zod schemas + `ZodValidationPipe` for request validation. Map `Either` results to HTTP exceptions.
- **Presenters**: Static `toHTTP()` methods that transform domain objects to API responses (strip sensitive fields).
- **Prisma repositories**: Map between Prisma types and domain entities at the repository boundary. Prisma-specific types (`Prisma.Decimal`, Prisma enums) never leak into core.
- **Auth**: JWT (HS256) with Passport. Global guards: `JwtAuthGuard` + `RolesGuard`. Decorators: `@Public()`, `@Roles()`, `@CurrentUser()`.
- **DI wiring**: `{ provide: AbstractClass, useClass: ConcreteClass }` in module providers.
- **Environment**: Zod schema validates all env vars at startup. Access via `EnvService.get('KEY')`.

## Key Conventions

- **Path alias**: `@/*` → `./src/*`
- **ESM**: `"type": "module"` — imports require `.js` extension
- **Refresh tokens**: SHA-256 hashed before storage. Token family tracking detects reuse.

## Testing Patterns

- **Unit tests** (`*.spec.ts`): In-memory repositories + fake services. No database. Convention: `sut` variable for System Under Test.
- **E2E tests** (`*.e2e-spec.ts`): Real NestJS app against test DB. Isolated PostgreSQL schema per run (UUID-based), auto-dropped after tests.
- **Test factories** in `src/test/factories/`: Helper functions for quickly creating test data.
- **Fake implementations** in `src/test/`: Deterministic substitutes for crypto, mailer, uploader, etc.
