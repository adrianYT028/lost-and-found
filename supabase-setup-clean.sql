-- Create enum for item status (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE enum_Items_status AS ENUM ('open', 'claimed', 'closed', 'active', 'matched');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Users table
CREATE TABLE IF NOT EXISTS "Users" (
    id SERIAL PRIMARY KEY,
    "firstName" VARCHAR(255),
    "lastName" VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "studentId" VARCHAR(255),
    course VARCHAR(255),
    year INTEGER,
    "phoneNumber" VARCHAR(255),
    avatar VARCHAR(255),
    role VARCHAR(50) DEFAULT 'student',
    "isVerified" BOOLEAN DEFAULT false,
    "emailVerificationToken" VARCHAR(255),
    "passwordResetToken" VARCHAR(255),
    "passwordResetExpires" TIMESTAMP,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Items table
CREATE TABLE IF NOT EXISTS "Items" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    category VARCHAR(255),
    location VARCHAR(255),
    type VARCHAR(255),
    status enum_Items_status DEFAULT 'open',
    images JSONB DEFAULT '[]',
    "userId" INTEGER REFERENCES "Users"(id),
    "adminNote" TEXT,
    "lastUpdatedBy" INTEGER REFERENCES "Users"(id),
    "collectionLocation" VARCHAR(255),
    "collectionInstructions" TEXT,
    "readyForCollectionAt" TIMESTAMP,
    "adminInCharge" INTEGER REFERENCES "Users"(id),
    "collectedBy" VARCHAR(255),
    "collectedAt" TIMESTAMP,
    "verificationMethod" VARCHAR(255) DEFAULT 'student_id',
    "collectionNotes" TEXT,
    "collectedByAdmin" INTEGER REFERENCES "Users"(id),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin user
INSERT INTO "Users" (
    "firstName", 
    "lastName", 
    email, 
    password, 
    role, 
    "isVerified", 
    "isActive"
) VALUES (
    'Admin',
    'User',
    'admin@college.edu',
    '$2a$10$wKc5n8aHf/3N2PYWr/ps/.E.BnJjQGfGTIv.mukOn04nfHzzJMBVm', -- admin123
    'admin',
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security (optional but recommended)
ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Items" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON "Users";
DROP POLICY IF EXISTS "Enable insert access for all users" ON "Users";
DROP POLICY IF EXISTS "Enable update access for all users" ON "Users";
DROP POLICY IF EXISTS "Enable delete access for all users" ON "Users";

DROP POLICY IF EXISTS "Enable read access for all users" ON "Items";
DROP POLICY IF EXISTS "Enable insert access for all users" ON "Items";
DROP POLICY IF EXISTS "Enable update access for all users" ON "Items";
DROP POLICY IF EXISTS "Enable delete access for all users" ON "Items";

-- Create policies for public access (since you're handling auth yourself)
CREATE POLICY "Enable read access for all users" ON "Users" FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON "Users" FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON "Users" FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON "Users" FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON "Items" FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON "Items" FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON "Items" FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON "Items" FOR DELETE USING (true);
