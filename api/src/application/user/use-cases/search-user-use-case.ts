import { UserRepository } from '@/domain/user/repositories/user-repository'

interface SearchUsersUseCaseRequest {
  query: string
}

interface UserSearchResult {
  username: string
  avatarUrl: string | null
}

export class SearchUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  // Usernames are literal identifiers, not free text with meaning to embed.
  // Semantic search (Challenge 13) earns its cost on content people write
  // in natural language; a handle like "jsilva92" has no semantics for
  // pgvector to exploit, so this stays a plain substring lookup.
  //
  // Integration note: requires a UserRepository.searchByUsername(query)
  // method (Prisma `contains`, case-insensitive) alongside the existing
  // findByUsername exact-match lookup used for uniqueness checks.
  async execute({ query }: SearchUsersUseCaseRequest): Promise<UserSearchResult[]> {
    const users = await this.userRepository.searchByUsername(query)

    return users.map((user) => ({
      username: user.username.value,
      avatarUrl: user.avatarUrl,
    }))
  }
}
