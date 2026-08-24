import { User } from '../entities/user';

export interface UserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByUsername(username: string): Promise<User | null>
  searchByUsername(query: string): Promise<User[]>
  findManyByIds(ids: string[]): Promise<User[]>
  save(user: User): Promise<void>
  delete(id: string): Promise<void>
}
