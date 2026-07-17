# Challenge 4 — Post Media Types + CreatePostUseCase
Extend the Post domain and build the use case.
Part A — Value Objects:

MediaType — validates image, video, article
PostTitle — min 3 chars, max 100 chars
ArticleContent — body min 100 chars, optional cover images max 10
ImageContent — array of 1 to 10 images
VideoContent — url required, duration max 600 seconds
Image — shared Value Object, url required
Update Post entity to use PostContent union type and PostTitle

Part B — Use Case:

Lives in application/post/use-cases/create-post.ts
Receives { authorId, title, mediaType, content }
Validates author exists via IUserRepository.findById()
Validates PostTitle
Validates MediaType
Builds the right content Value Object based on mediaType
Creates Post entity
Saves via PostRepository.save()
Returns Result<Post>

Tests:

should create an article post successfully
should create an image post successfully
should create a video post successfully
should fail if author does not exist
should fail if title is too short
should fail if image count exceeds 10
should fail if video duration exceeds 600 seconds
should not save if validation fails


Business rules defined so far:
Post deletion:

User deletes own post → hard delete
Moderation deletes post → soft delete → QuarantineZone for review

User deletion:

User deletes account → soft delete → Cemetery for 30 days
Within 30 days → can reactivate
After 30 days → permanent hard delete via background job

Age:

Minimum 18 years old to register

Username:

Unique across the platform
Minimum 2 characters, no spaces

Post content:

Article: min 100 chars, optional cover images max 10, low resolution
Images: 1 to 10 images per post
Video: max 10 minutes (600 seconds)