# Challenge 1 — Post Domain
Build the Post domain.

PostContent Value Object — not empty, max 5000 characters, no pure whitespace
Post Entity with: id, content, authorId, createdAt, updatedAt, deletedAt
edit(newContent: PostContent) — updates content and sets updatedAt
delete() — soft delete, sets deletedAt
IPostRepository interface with: findById, findByAuthor, save
Tests: valid post, empty content, edit method, delete method