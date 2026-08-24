import { Follow } from '@/application/follow/entities/follow'
import { FollowRepository } from '@/domain/follow/repositories/follow-repository'
import { prisma } from './lib/prisma'

export class PrismaFollowRepository implements FollowRepository {

  async exists(followerId: string, followingId: string): Promise<boolean> {
    const row = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    })
    return row !== null
  }

  async create(follow: Follow): Promise<void> {
    await prisma.follow.create({
      data: {
        followerId: follow.followerId,
        followingId: follow.followingId,
        createdAt: follow.createdAt,
      },
    })
  }

  async delete(followerId: string, followingId: string): Promise<void> {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    })
  }

  async findFollowingIds(followerId: string): Promise<string[]> {
    const rows = await prisma.follow.findMany({
      where: { followerId },
      select: { followingId: true },
    })
    return rows.map(row => row.followingId)
  }
}
