-- Enable pgvector before creating the vector column
CREATE EXTENSION IF NOT EXISTS vector;
-- Add the 384-dimensional embedding column
ALTER TABLE "DocumentChunk"
ADD COLUMN "embedding" vector(384);