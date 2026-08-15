import { User } from "@/domain/user/entities/user"
import { UserRepository } from "@/domain/user/repositories/UserRepository"
import { Age } from "@/domain/user/value-objects/age"
import { Email } from "@/domain/user/value-objects/email"
import { Password } from "@/domain/user/value-objects/password"
import { UserId } from "@/domain/user/value-objects/userId"
import { UserName } from "@/domain/user/value-objects/username"
import { prisma } from "./lib/prisma"

export class PrismaUserRepository implements UserRepository {

  async findById(id: string): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { id } })
    if (!row) return null
    return this.toDomain(row)
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { email } })
    if (!row) return null
    return this.toDomain(row)
  }

  async findByUsername(username: string): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { username } })
    if (!row) return null
    return this.toDomain(row)
  }

  async save(user: User): Promise<void> {
    const data = this.toPersistence(user)
    await prisma.user.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  // DB row → domain object
  // rebuilds the domain object from persisted data without re-validating business rules
  private toDomain(row: any): User {
    return User.create({
      id: UserId.create(row.id).value,
      email: Email.create(row.email).value,
      username: UserName.create(row.username).value,
      age: Age.create(row.age).value,
      password: Password.createHashed(row.password).value, // skips validation rules
      name: row.name ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt ?? null,
      deletedAt: row.deletedAt ?? null,
    }).value
  }

  // domain object → DB row
  // translates domain concepts to raw persistence format
  private toPersistence(user: User) {
    return {
      id: user.id.value,
      email: user.email.value,
      username: user.username.value,
      age: user.age.value,
      password: user.password.value,
      name: user.name ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt ?? null,
      deletedAt: user.deletedAt ?? null,
    }
  }
}
