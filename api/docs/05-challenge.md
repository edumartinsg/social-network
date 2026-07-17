Challenge 5 — Auth + Infrastructure (combined, bigger scope)
Let's accelerate. This challenge bridges domain → real infrastructure. Bigger, but you have momentum.

Part A — AuthenticateUserUseCase (domain layer)
Location: application/user/use-cases/authenticate-user.ts
typescriptinterface AuthenticateUserUseCaseRequest {
  email: string
  password: string
}
Steps:

Find user by email via IUserRepository.findByEmail() — if not found, return Result.fail('Invalid credentials')
Compare password using IEncryptor.compare(plainPassword, user.password.value)
If doesn't match, return Result.fail('Invalid credentials') (same message — never reveal which field was wrong)
Return Result.ok(user)

Tests:

should authenticate successfully with correct credentials
should fail if user not found
should fail if password doesn't match
should return the same error message for both failure cases (security)


Part B — Prisma Setup
bashcd apps/api
npm install prisma @prisma/client
npx prisma init
This creates prisma/schema.prisma. Define your schema based on your domain:
prismadatasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  username  String   @unique
  name      String?
  age       Int
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime?
  deletedAt DateTime?

  posts Post[]

  @@map("users")
}

model Post {
  id                    String    @id @default(uuid())
  title                 String
  caption               String?
  authorId              String
  mediaType             String
  content               Json
  createdAt             DateTime  @default(now())
  updatedAt             DateTime?
  deletedAt             DateTime?
  isDeletedByModeration Boolean   @default(false)

  author User @relation(fields: [authorId], references: [id])

  @@map("posts")
}
Why content Json: your PostContent union (ArticleContent | ImageContent | VideoContent) doesn't map cleanly to relational columns. Store it as JSONB — PostgreSQL handles this natively, and your repository will serialize/deserialize.

Part C — PrismaUserRepository
Location: infrastructure/database/prisma-user-repository.ts
This is the hardest part conceptually — mapping between Prisma rows and domain objects.
typescriptimport { PrismaClient } from '@prisma/client'
import { IUserRepository } from '@/domain/user/repositories/IUserRepository'
import { User } from '@/domain/user/entities/user'
import { Email } from '@/domain/user/value-objects/email'
import { Password } from '@/domain/user/value-objects/password'
import { UserName } from '@/domain/user/value-objects/username'
import { Age } from '@/domain/user/value-objects/age'

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } })
    if (!row) return null
    return this.toDomain(row)
  }

  async findByUsername(username: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { username } })
    if (!row) return null
    return this.toDomain(row)
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } })
    if (!row) return null
    return this.toDomain(row)
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id.value },
      create: this.toPersistence(user),
      update: this.toPersistence(user),
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  // Prisma row → Domain object
  private toDomain(row: any): User {
    return User.create({
      id: row.id, // adjust based on your UserId.create() signature
      email: Email.create(row.email).value,
      username: UserName.create(row.username).value,
      age: Age.create(row.age).value,
      password: Password.create(row.password).value, // already hashed — see note below
      name: row.name ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }).value
  }

  // Domain object → Prisma row
  private toPersistence(user: User) {
    return {
      id: user.id.value,
      email: user.email.value,
      username: user.username.value,
      age: user.age.value,
      password: user.password.value,
      name: user.name ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    }
  }
}
One real problem you'll hit:
Password.create() validates with rules (uppercase, number, special char). But a hashed password from the DB won't pass those rules — it's a bcrypt hash like $2b$10$....
This is exactly the isHashed problem from earlier. Think about how to solve it — you have the pieces already from the Password Value Object work. Try to solve this yourself before asking.

Part D — Docker + PostgreSQL
yaml# docker-compose.yml at apps/api/
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: social_network
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
bashdocker compose up -d
.env:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/social_network"
bashnpx prisma migrate dev --name init
This creates your tables for real.

Tests for this challenge

AuthenticateUserUseCase — unit tests with mocks (same pattern as before)
PrismaUserRepository — integration test, real database via Docker:

typescriptdescribe('PrismaUserRepository', () => {
  test('should save and retrieve a user', async () => {
    const repo = new PrismaUserRepository(prisma)
    const user = User.create({ ... }).value
    await repo.save(user)
    const found = await repo.findById(user.id.value)
    expect(found?.email.value).toBe(user.email.value)
  })
})

This is a big challenge — take it in order: Part A first (familiar territory), then B/C/D together (new territory, the Password solution is the key unlock).