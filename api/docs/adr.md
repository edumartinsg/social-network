
## ADR 

Project: Social Network — Architecture & Decision Log
Stack

Runtime: Node.js
Language: TypeScript
Architecture: DDD + Clean Architecture
Testing: Vitest
Package manager: npm
Monorepo structure: apps/api (backend), apps/web (frontend — coming)


HTTP Request (real data arrives here)
     ↓
presentation/     → extracts raw data from request (req.body)
     ↓
application/      → passes raw data to Value Objects for validation
     ↓
domain/           → validates, creates objects, applies business rules
     ↓
infrastructure/   → converts domain objects → DB rows → saves
     ↓
database          → real data persisted here


Architectural Decisions
ADR-001 — DDD + Clean Architecture
Chose Domain-Driven Design with Clean Architecture layers to:

Keep business rules independent of frameworks and databases
Make the codebase testable without a real database
Allow swapping infrastructure (Prisma → anything else) without touching domain logic

ADR-002 — Layer structure
domain/         → entities, value objects, repository interfaces
application/    → use cases
infrastructure/ → repository implementations, external services
presentation/   → HTTP routes and controllers (coming)
Dependency rule: arrows point inward. Domain knows nothing outside itself.
ADR-003 — Result<T> pattern instead of exceptions
All operations that can fail return Result<T> instead of throwing exceptions. Validation failures are data, not errors.
typescriptconst result = Email.create('invalid')
if (result.isFailure) return Result.fail(result.error)
ADR-004 — Private constructor + Static Factory Method
All entities and value objects use private constructors. The only way to create an instance is through create(), which validates first. An invalid object can never exist.
ADR-005 — Repository pattern
Repository interfaces live in domain/. Implementations live in infrastructure/. Domain never imports Prisma, never imports any database driver.
ADR-006 — Dependency Inversion for external services
IEncryptor interface lives in domain/shared/interfaces/. BcryptEncryptor implements it in infrastructure/services/. Domain never imports bcrypt.
ADR-007 — Composition over inheritance for Post content types
Post content is modelled as a union type ArticleContent | ImageContent | VideoContent rather than subclasses ArticlePost extends Post. One Post entity, one repository, one use case with internal branching per content type.
ADR-008 — Validate before database calls
In use cases, all Value Object validation happens before any repository calls. No DB hits with invalid data.
ADR-009 — Monorepo structure
Project uses a monorepo with apps/api and apps/web. Shared types will live in packages/ when needed.
ADR-010 — Git workflow

Feature branches: feat/, fix/, refactor/, chore/
Conventional Commits: feat(domain): add Email value object
PRs into main — no direct commits to main
One PR per feature


Domain Model
User aggregate:
ConceptTypeRulesUserEntityIdentity via UserIdUserIdValue ObjectValid UUIDEmailValue ObjectValid format, stored lowercasePasswordValue ObjectMin 8 chars, uppercase, number, special charUserNameValue ObjectMin 2 chars, no spaces, unique on platformAgeValue ObjectMust be 18 or older
Post aggregate:
ConceptTypeRulesPostEntityIdentity via PostIdPostTitleValue ObjectMin 3 chars, max 100 charsMediaTypeValue ObjectOnly: image, video, articleArticleContentValue ObjectBody min 100 chars, max 10 cover imagesImageContentValue Object1 to 10 imagesVideoContentValue ObjectURL required, max 600 secondsImageValue ObjectURL requiredPostContentUnion typeArticleContent | ImageContent | VideoContent

Business Rules
User registration:

Minimum age: 18 years old
Email must be unique across the platform
Username must be unique across the platform
Password: min 8 chars, at least one uppercase, one number, one special character
Password is always hashed before persisting — never stored in plain text

Post creation:

Author must exist before creating a post
Article: body minimum 100 characters, optional cover images maximum 10
Images: minimum 1, maximum 10 per post
Video: maximum 10 minutes (600 seconds)

Post deletion:

User deletes own post → hard delete — removed from database permanently
Moderation deletes post → soft delete → sent to QuarantineZone for review

User deletion:

User deletes account → soft delete → sent to Cemetery
Within 30 days → user can reactivate account
After 30 days → permanent hard delete via background job

Feed (future):

No infinite scroll
Algorithm controlled by the user
Chronological by default
User defines their own content preferences


Infrastructure Decisions
Database: PostgreSQL (chosen for pgvector support for future AI features)
Encryption: bcrypt via BcryptEncryptor implements IEncryptor
Coming:

Prisma as ORM
Redis for rate limiting and caching
Fastify for HTTP layer
Docker + docker-compose
AWS deployment
GitHub Actions CI/CD
Next.js frontend


Testing Strategy
LayerTypeToolsValue ObjectsUnit — validates rulesVitestEntitiesUnit — validates behaviourVitestUse CasesUnit — mocked dependenciesVitest + vi.fn()RepositoriesIntegration — real DBVitest + real Prisma (coming)HTTPIntegration — real serverVitest + Supertest (coming)Full flowE2EPlaywright (coming)
Rules:

Domain tests use mocks — never real database
One test per behaviour, not per line of code
Test failure cases as much as happy path
beforeEach resets all mocks — no shared state between tests


Folder Structure
apps/
└── api/
    └── src/
        ├── application/
        │   ├── post/
        │   │   └── use-cases/
        │   │       └── create-post.ts
        │   └── user/
        │       └── use-cases/
        │           └── create-user.ts
        ├── domain/
        │   ├── post/
        │   │   ├── entities/
        │   │   │   └── post.ts
        │   │   ├── repositories/
        │   │   │   └── IPostRepository.ts
        │   │   └── value-objects/
        │   │       ├── content/
        │   │       │   ├── ArticleContent.ts
        │   │       │   ├── ImageContent.ts
        │   │       │   └── VideoContent.ts
        │   │       ├── Image.ts
        │   │       ├── MediaType.ts
        │   │       ├── PostContent.ts
        │   │       └── PostTitle.ts
        │   ├── shared/
        │   │   └── interfaces/
        │   │       ├── IEncryptor.ts
        │   │       ├── entity.ts
        │   │       ├── result.ts
        │   │       └── valueObject.ts
        │   └── user/
        │       ├── entities/
        │       │   └── user.ts
        │       ├── repositories/
        │       │   └── IUserRepository.ts
        │       └── value-objects/
        │           ├── age.ts
        │           ├── email.ts
        │           ├── password.ts
        │           ├── userId.ts
        │           └── username.ts
        ├── infrastructure/
        │   ├── database/
        │   └── services/
        │       └── bcrypt.ts
        └── presentation/
            └── http/
                └── server.ts