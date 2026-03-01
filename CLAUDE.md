# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FastFeet is a RESTful API for a shipping company, built with **NestJS 11 + Clean Architecture**. It manages users (admins/couriers), recipients, and orders through a delivery lifecycle: **PENDING → WAITING → WITHDRAWN → DELIVERED → RETURNED**.

## Commands

| Task               | Command                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| Dev server         | `npm run start:dev`                                                                                       |
| Build              | `npm run build`                                                                                           |
| Lint (auto-fix)    | `npm run lint`                                                                                            |
| Format             | `npm run format`                                                                                          |
| Typecheck          | `npm run typecheck`                                                                                       |
| All unit tests     | `npm test`                                                                                                |
| Single unit test   | `npx vitest src/core/use-cases/create-user-use-case.spec.ts`                                              |
| Unit tests (watch) | `npm run test:watch`                                                                                      |
| All E2E tests      | `npm run test:e2e`                                                                                        |
| Single E2E test    | `npx vitest --config vitest.config.e2e.ts src/infra/http/controllers/authenticate.controller.e2e-spec.ts` |
| E2E tests (watch)  | `npm run test:e2e:watch`                                                                                  |
| Run migrations     | `npx prisma migrate dev`                                                                                  |
| Seed admin user    | `npx prisma db seed`                                                                                      |
| Start databases    | `docker compose up -d`                                                                                    |

E2E tests require the test database running on port 5433 (`docker compose up -d`).

## Architecture

### Clean Architecture Layers

```
src/core/          → Pure business logic, no framework dependencies
src/infra/         → NestJS controllers, Prisma repos, external service implementations
src/test/          → Test doubles (in-memory repos, fakes, factories)
src/generated/     → Auto-generated Prisma client (do not edit)
```

**Dependency rule**: `core/` never imports from `infra/`. Core defines abstract interfaces; infra provides implementations via NestJS DI.

### Core Layer (`src/core/`)

- **Use-cases** (`core/use-cases/`): One class per feature. Each is `@Injectable()`, receives dependencies via constructor, returns `Either<Error, Success>`. Never throws exceptions.
- **Repositories** (`core/repositories/`): Abstract classes defining data access contracts. Implementations live in `infra/database/prisma/repositories/`.
- **Either monad** (`core/errors/either.ts`): `Left` = failure, `Right` = success. Use `left()` / `right()` helpers. Check with `.isLeft()` / `.isRight()`.
- **Error types** (`core/errors/`): Each business error implements `UseCaseError`. Controllers map these to HTTP exceptions.
- **Abstract services**: `Encrypter`, `HashGenerator`, `HashComparer`, `TokenHasher` (in `core/cryptography/`), `Mailer` (in `core/messaging/`), `Uploader` (in `core/storage/`).

### Infrastructure Layer (`src/infra/`)

- **Entry point**: `infra/main.ts`
- **Root module**: `infra/app.module.ts` — imports ConfigModule (Zod-validated env), EnvModule, DatabaseModule, CryptographyModule, HttpModule, AuthModule, StorageModule
- **DI wiring**: Abstract-to-implementation binding via `{ provide: AbstractClass, useClass: ConcreteClass }` in module providers
- **Controllers** (`infra/http/controllers/`): Use Zod schemas + `ZodValidationPipe` for request validation. Map `Either` results to NestJS HTTP exceptions.
- **Presenters** (`infra/http/presenters/`): Static `toHTTP()` methods that transform domain objects to API responses.
- **Auth** (`infra/auth/`): JWT (HS256) with Passport. Two global guards: `JwtAuthGuard` + `RolesGuard` applied via `APP_GUARD`. Use `@Public()` to skip auth, `@Roles('ADMIN')` for role restriction, `@CurrentUser()` for token payload injection.
- **Environment** (`infra/env/`): Zod schema validates all env vars at startup. Access via `EnvService.get('KEY')`.

### Module Dependency Graph

```
AppModule
├── ConfigModule (global, Zod validation)
├── EnvModule → EnvService
├── DatabaseModule → PrismaService + all repository bindings
├── CryptographyModule → Encrypter, HashGenerator, HashComparer, TokenHasher
├── AuthModule → JwtStrategy, JwtAuthGuard (global), RolesGuard (global)
├── StorageModule → Uploader (R2Storage)
├── MessagingModule → Mailer (NodemailerMailer)
└── HttpModule → all controllers + use-case providers
```

## Key Conventions

- **Path alias**: `@/*` maps to `./src/*`. Resolved by `tsc-alias` at build time and `vite-tsconfig-paths` in Vitest.
- **ESM**: Project uses ES modules (`"type": "module"` in package.json, `"module": "nodenext"` in tsconfig). Imports from local files in infra require `.js` extension in some contexts.
- **Prisma models as entities**: The project uses Prisma-generated types directly instead of separate domain entity classes. Models are in `src/generated/prisma/client`.
- **CPF validation**: Custom Zod schema with checksum validation in `core/utils/`. CPFs are normalized to 11 digits (no punctuation) before storage.
- **Order geolocation**: `OrdersRepository.findManyNearby()` uses raw SQL with Haversine formula (20km radius). The Prisma implementation handles dynamic schema names for E2E test isolation.
- **File uploads**: Multer `FileInterceptor` → NestJS validation (5MB max, image/png|jpeg|jpg) → R2Storage (Cloudflare R2 via S3 SDK).
- **Refresh tokens**: SHA-256 hashed before storage. Token family tracking detects reuse (security feature).

## Testing Patterns

- **Unit tests** (`*.spec.ts`): Use in-memory repositories (`src/test/repositories/`) and fake crypto (`src/test/cryptography/`). No database needed. Convention: `sut` variable for System Under Test.
- **E2E tests** (`*.e2e-spec.ts`): Spin up real NestJS app against test DB. Each test run creates an isolated PostgreSQL schema (UUID-based), runs migrations, truncates tables between tests, drops schema after all tests.
- **Test factories** (`src/test/factories/`): `makeUser()`, `makeAdmin()`, `makeCourier()`, `makeRecipient()`, `makeOrder()`, `makeAccessToken()` — for quickly creating test data.
- **Fake implementations**: `FakeHashGenerator` appends `-hashed`, `FakeEncrypter` returns JSON string, `FakeMailer` collects sent emails in array.

## Code Style

- Prettier: 82 char width, single quotes, no semicolons, trailing commas (es5), LF line endings
- ESLint: flat config with TypeScript + Prettier integration
- Lefthook git hooks: format on commit, typecheck + lint + test on push
- SWC compiler for faster builds (configured in `nest-cli.json`)
