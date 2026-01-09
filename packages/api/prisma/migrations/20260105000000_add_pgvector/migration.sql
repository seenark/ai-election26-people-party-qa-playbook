-- prisma/migrations/XXXXXXXXXXXXXX_add-policy-chunks/migration.sql

-- Ensure pgvector extension exists
CREATE EXTENSION IF NOT EXISTS vector;

-- Create policies table (if not already created by another migration)
-- (If Prisma has already created these tables for you, remove the CREATE TABLEs below
-- and only keep the ALTER TABLE / CREATE INDEX statements.)

-- Policy table (align with schema.prisma)
CREATE TABLE IF NOT EXISTS "policies" (
  "id"         uuid PRIMARY KEY,
  "slug"       text UNIQUE NOT NULL,
  "title"      text NOT NULL,
  "markdown"   text NOT NULL,
  "category"   text,
  "level"      text NOT NULL,
  "region"     text,
  "url"        text NOT NULL,
  "status"     text NOT NULL,
  "created_at" timestamptz(3) NOT NULL DEFAULT NOW(),
  "updated_at" timestamptz(3) NOT NULL DEFAULT NOW()
);

-- Policy chunks table with pgvector embedding
CREATE TABLE IF NOT EXISTS "policy_chunks" (
  "id"          uuid PRIMARY KEY,
  "policy_id"   uuid NOT NULL REFERENCES "policies" ("id") ON DELETE CASCADE,
  "chunk_index" integer NOT NULL,
  "content"     text NOT NULL,
  "embedding"   vector(1024) NOT NULL, -- google gemini embedding default is 3072
  "created_at"  timestamptz(3) NOT NULL DEFAULT NOW()
);

-- Index on policy_id for fast joins
CREATE INDEX IF NOT EXISTS "policy_chunks_policy_id_idx"
  ON "policy_chunks" ("policy_id");

-- Vector index for cosine similarity search
CREATE INDEX IF NOT EXISTS "policy_chunks_embedding_idx"
  ON "policy_chunks"
  USING ivfflat ("embedding" vector_cosine_ops)
  WITH (lists = 100);
