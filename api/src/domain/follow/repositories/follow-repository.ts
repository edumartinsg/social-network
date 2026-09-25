import { Follow } from "../../../application/follow/entities/follow"

export interface FollowRepository {
  exists(followerId: string, followingId: string): Promise<boolean>
  create(follow: Follow): Promise<void>
  delete(followerId: string, followingId: string): Promise<void>
  findFollowingIds(followerId: string): Promise<string[]>
}
