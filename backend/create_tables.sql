-- Create database tables manually
-- Run this in your PostgreSQL database: lost_found

-- Users table
CREATE TABLE IF NOT EXISTS "Users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "studentId" VARCHAR(255) UNIQUE,
  "phone" VARCHAR(255),
  "isActive" BOOLEAN DEFAULT true,
  "emailVerified" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Items table
CREATE TABLE IF NOT EXISTS "Items" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "category" VARCHAR(255) NOT NULL,
  "type" VARCHAR(10) NOT NULL CHECK ("type" IN ('lost', 'found')),
  "location" VARCHAR(255),
  "date" TIMESTAMP,
  "status" VARCHAR(20) DEFAULT 'active' CHECK ("status" IN ('active', 'matched', 'closed')),
  "contactInfo" JSONB,
  "images" JSONB DEFAULT '[]',
  "tags" JSONB DEFAULT '[]',
  "ownerId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Matches table (for AI matching)
CREATE TABLE IF NOT EXISTS "Matches" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "lostItemId" UUID NOT NULL REFERENCES "Items"("id") ON DELETE CASCADE,
  "foundItemId" UUID NOT NULL REFERENCES "Items"("id") ON DELETE CASCADE,
  "similarity" FLOAT NOT NULL CHECK ("similarity" >= 0 AND "similarity" <= 100),
  "confidence" VARCHAR(10) NOT NULL CHECK ("confidence" IN ('low', 'medium', 'high')),
  "status" VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'confirmed', 'rejected', 'expired')),
  "matchType" VARCHAR(20) NOT NULL DEFAULT 'ai_generated' CHECK ("matchType" IN ('ai_generated', 'user_suggested', 'manual')),
  "confirmedAt" TIMESTAMP NULL,
  "confirmedBy" UUID NULL REFERENCES "Users"("id"),
  "notes" TEXT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_items_owner" ON "Items"("ownerId");
CREATE INDEX IF NOT EXISTS "idx_items_type" ON "Items"("type");
CREATE INDEX IF NOT EXISTS "idx_items_category" ON "Items"("category");
CREATE INDEX IF NOT EXISTS "idx_items_status" ON "Items"("status");
CREATE INDEX IF NOT EXISTS "idx_items_created" ON "Items"("createdAt");

CREATE INDEX IF NOT EXISTS "idx_matches_lost_item" ON "Matches"("lostItemId");
CREATE INDEX IF NOT EXISTS "idx_matches_found_item" ON "Matches"("foundItemId");
CREATE INDEX IF NOT EXISTS "idx_matches_status" ON "Matches"("status");
CREATE INDEX IF NOT EXISTS "idx_matches_similarity" ON "Matches"("similarity" DESC);

-- Insert a test user (optional)
INSERT INTO "Users" ("firstName", "lastName", "email", "password", "studentId") 
VALUES ('Test', 'User', 'test@example.com', '$2b$10$placeholder_hash', 'TEST001')
ON CONFLICT ("email") DO NOTHING;
