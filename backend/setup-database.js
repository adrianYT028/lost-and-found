const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  user: process.env.DB_USERNAME || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'lost_found',
  password: process.env.DB_PASSWORD || 'adrian',
  port: process.env.DB_PORT || 5432,
});

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Setting up database tables...');

    // Create Users table
    await client.query(`
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
    `);
    console.log('✅ Users table created');

    // Create Items table
    await client.query(`
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
    `);
    console.log('✅ Items table created');

    // Create Matches table for AI matching
    await client.query(`
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
    `);
    console.log('✅ Matches table created');

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS "idx_items_owner" ON "Items"("ownerId");
      CREATE INDEX IF NOT EXISTS "idx_items_type" ON "Items"("type");
      CREATE INDEX IF NOT EXISTS "idx_items_category" ON "Items"("category");
      CREATE INDEX IF NOT EXISTS "idx_items_status" ON "Items"("status");
      CREATE INDEX IF NOT EXISTS "idx_items_created" ON "Items"("createdAt");
      
      CREATE INDEX IF NOT EXISTS "idx_matches_lost_item" ON "Matches"("lostItemId");
      CREATE INDEX IF NOT EXISTS "idx_matches_found_item" ON "Matches"("foundItemId");
      CREATE INDEX IF NOT EXISTS "idx_matches_status" ON "Matches"("status");
      CREATE INDEX IF NOT EXISTS "idx_matches_similarity" ON "Matches"("similarity" DESC);
    `);
    console.log('✅ Database indexes created');

    // Insert test data (optional)
    await client.query(`
      INSERT INTO "Users" ("firstName", "lastName", "email", "password", "studentId") 
      VALUES ('Test', 'User', 'test@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'TEST001')
      ON CONFLICT ("email") DO NOTHING;
    `);
    console.log('✅ Test user created');

    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    client.release();
  }
};

const dropTables = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🗑️ Dropping existing tables...');
    
    await client.query(`
      DROP TABLE IF EXISTS "Matches" CASCADE;
      DROP TABLE IF EXISTS "Items" CASCADE;
      DROP TABLE IF EXISTS "Users" CASCADE;
    `);
    
    console.log('✅ Tables dropped');
    
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Main function
const main = async () => {
  try {
    const args = process.argv.slice(2);
    
    if (args.includes('--drop')) {
      await dropTables();
    }
    
    await createTables();
    
    console.log('✨ Database is ready to use!');
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { createTables, dropTables };
