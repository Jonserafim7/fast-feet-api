# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

This project follows **Clean Architecture** with strict separation between domain logic and infrastructure:

### Core Layer (`src/core/`)

Pure business logic with zero framework dependencies. Contains:

- **use-cases/**: Single-responsibility application logic (e.g., `CreateUserUseCase`)
- **repositories/**: Abstract repository interfaces (dependency inversion)
- **cryptography/**: Crypto contracts (`Encrypter`, `HashGenerator`, `HashComparer`)
- **errors/**: Functional error handling using `Either<Left, Right>` monad pattern

### Infrastructure Layer (`src/infra/`)

Framework-specific implementations that satisfy core contracts:

- **http/**: NestJS controllers with Zod validation pipes
- **database/prisma/repositories/**: Concrete repository implementations
- **cryptography/**: Bcrypt and JWT implementations
- **auth/**: JWT strategy, guards (`JwtAuthGuard`, `RolesGuard`), decorators (`@Public`, `@Roles`, `@CurrentUser`)
- **env/**: Zod-validated environment configuration

### Test Layer (`src/test/`)

Test doubles for isolated testing:

- **repositories/**: In-memory implementations (array-based)
- **cryptography/**: Fake implementations for tests

## Development Workflow

### Running the Application

```bash
# Development with watch mode
npm run start:dev

# Production build (includes tsc-alias for path resolution)
npm run build
npm run start:prod
```

### Testing

```bash
# Unit tests (uses in-memory repositories and fakes)
npm run test
npm run test:watch

# E2E tests (uses test database on port 5433)
npm run test:e2e
npm run test:e2e:watch
```

**Testing Strategy**:

- Unit tests (`**/*.spec.ts`): Test use cases in isolation with in-memory repositories
- E2E tests (`**/*.e2e-spec.ts`): Test full HTTP flow with real NestJS app and test database
- E2E setup creates isolated schema per test run using UUID, runs `prisma migrate deploy`, truncates tables after each test, and drops schema after all tests

### Database

```bash
# Start Docker containers (dev DB on 5432, test DB on 5433)
docker compose up -d

# Run migrations
npx prisma migrate dev

# Reset database (used by E2E tests)
npx prisma migrate reset --force
```

## Feature Development Pattern

When adding new features, follow this sequence:

1. **Define Use Case** in `src/core/use-cases/`
   - Return `Either<ErrorType, SuccessType>` for functional error handling
   - Inject repository interfaces via constructor

2. **Define Repository Interface** in `src/core/repositories/` (if needed)
   - Abstract contract with no implementation details

3. **Implement Repository** in `src/infra/database/prisma/repositories/`
   - Concrete implementation using Prisma client
   - Register in `DatabaseModule`

4. **Create In-Memory Repository** in `src/test/repositories/`
   - Array-based implementation for unit testing

5. **Create Controller** in `src/infra/http/controllers/`
   - Use Zod schemas with `ZodValidationPipe` for validation
   - Transform `Either` results into HTTP responses
   - Apply guards: `@Roles('ADMIN')` for admin-only endpoints

6. **Write Tests**
   - Unit test: Test use case with in-memory repository
   - E2E test: Test full HTTP flow with `supertest`

## Authentication & Authorization

**JWT with HS256 symmetric encryption**:

- Login via `/sessions` (public) returns JWT token
- Protected routes require `Authorization: Bearer <token>` header
- Token payload: `{ sub: userId, role: 'ADMIN' | 'COURIER' }`

**Guards** (applied globally):

- `JwtAuthGuard`: Validates JWT and extracts user
- `RolesGuard`: Checks if user role matches `@Roles()` decorator

**Decorators**:

- `@Public()`: Skip JWT authentication
- `@Roles('ADMIN')`: Restrict to admin users only
- `@CurrentUser()`: Inject authenticated user into route handler

## Domain Model

**Key Entities** (from Prisma schema):

- **User**: `{ role: 'ADMIN' | 'COURIER', cpf, passwordHash }` - Login with CPF
- **Order**: Status flow `WAITING → WITHDRAWN → DELIVERED/RETURNED`
- **Recipient**: Delivery recipients with notifications
- **Attachment**: Delivery proof photos (required for DELIVERED status)

**Business Rules**:

- Only ADMIN can perform CRUD on users, recipients, orders
- Only the courier who withdrew an order can mark it as delivered
- Delivered orders require photo attachment
- Couriers can only list their own orders

## Error Handling

Use the `Either` pattern in use cases:

```typescript
// In use case
return left(new UserAlreadyExistsError());
return right(user);

// In controller
const result = await useCase.execute(data);
if (result.isLeft()) {
  throw new ConflictException(result.value.message);
}
return result.value;
```

## Environment Variables

Required variables (validated with Zod in `src/infra/env/`):

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT signing (HS256)
- `PORT`: Server port (optional, defaults to 3000)

## Path Aliases

Import using `@/*` instead of relative paths:

```typescript
import { UsersRepository } from '@/core/repositories/users-repository';
```

Build process uses `tsc-alias` to resolve aliases in compiled output.
