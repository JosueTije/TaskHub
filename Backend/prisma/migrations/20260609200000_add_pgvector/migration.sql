-- Enable pgvector extension (requires pg_vector installed on PostgreSQL server)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to Ticket (768 dims = nomic-embed-text-v1.5)
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "embedding" vector(768);

-- HNSW index for fast cosine similarity search
-- m=16 ef_construction=64 are good defaults for datasets up to ~1M rows
CREATE INDEX IF NOT EXISTS "ticket_embedding_hnsw_idx"
ON "Ticket" USING hnsw ("embedding" vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
