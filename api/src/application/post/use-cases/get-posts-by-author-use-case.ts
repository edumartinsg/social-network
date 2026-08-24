import { Post } from '@/domain/post/entities/post'
import { PostRepository } from '@/domain/post/repositories/post-repository'
import { Result } from '@/domain/shared/result'
import { User } from '@/domain/user/entities/user'
import { UserRepository } from '@/domain/user/repositories/user-repository'

interface GetPostsByAuthorUseCaseRequest {
  username: string
}

interface GetPostsByAuthorUseCaseResponse {
  author: User
  posts: Post[]
}

export class GetPostsByAuthorUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
  ) {}

  // The route takes a username, not a UserId -- URLs are for people, not
  // internal identifiers. A missing author is reported as a failure here,
  // the same way a missing post is elsewhere, so the controller can turn it
  // into a 404 without a special case.
  //
  // Returns raw Post + User, not FeedPostView -- application/ must not
  // import from presentation/ (the dependency rule established since
  // Challenge 6). Mapping to the read-model happens in the controller,
  // same as GetFeedUseCase already does.
  async execute({
    username,
  }: GetPostsByAuthorUseCaseRequest): Promise<Result<GetPostsByAuthorUseCaseResponse>> {
    const author = await this.userRepository.findByUsername(username)
    if (!author) {
      return Result.fail('User not found')
    }

    const posts = await this.postRepository.findByAuthor(author.id.value)

    return Result.ok({ author, posts })
  }
}
