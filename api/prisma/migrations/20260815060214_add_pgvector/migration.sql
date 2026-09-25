-- prisma/migrations/<timestamp>_add_pgvector/migration.sql
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "posts" ADD COLUMN "embedding" vector(768);

-- HNSW index: makes similarity search fast at scale.
-- Without this, every search does a full table scan comparing
-- the query vector against every single row -- fine for hundreds
-- of posts, unacceptably slow for millions.
CREATE INDEX ON "posts" USING hnsw ("embedding" vector_cosine_ops);
