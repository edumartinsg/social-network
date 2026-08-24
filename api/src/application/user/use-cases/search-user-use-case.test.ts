import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SearchUsersUseCase } from './search-user-use-case'

describe('SearchUsersUseCase', () => {
  const userRepository = {
    searchByUsername: vi.fn(),
  }

  let sut: SearchUsersUseCase

  beforeEach(() => {
    vi.clearAllMocks()
    sut = new SearchUsersUseCase(userRepository as any)
  })

  it('maps repository results into the public username/avatarUrl shape', async () => {
    userRepository.searchByUsername.mockResolvedValue([
      { username: { value: 'janedoe' }, avatarUrl: 'https://cdn/janedoe.png' },
      { username: { value: 'janedash' }, avatarUrl: null },
    ])

    const results = await sut.execute({ query: 'jane' })

    expect(results).toEqual([
      { username: 'janedoe', avatarUrl: 'https://cdn/janedoe.png' },
      { username: 'janedash', avatarUrl: null },
    ])
  })

  it('forwards the raw query to the repository unmodified', async () => {
    // No trimming, no lowercasing here -- that normalisation belongs to
    // whichever layer owns the actual `contains` query, so this test pins
    // down that the use case does not silently add its own.
    userRepository.searchByUsername.mockResolvedValue([])

    await sut.execute({ query: '  Jane  ' })

    expect(userRepository.searchByUsername).toHaveBeenCalledWith('  Jane  ')
  })

  it('returns an empty array when nothing matches', async () => {
    userRepository.searchByUsername.mockResolvedValue([])

    const results = await sut.execute({ query: 'nobody' })

    expect(results).toEqual([])
  })
})
