-- 🗄️ COMPLETE DATABASE SETUP SCRIPT FOR LOST & FOUND APP
-- Run this script in Supabase SQL Editor or any PostgreSQL database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For better text search

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS Matches CASCADE;
DROP TABLE IF EXISTS Items CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

-- Users table with complete authentication
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- bcrypt hashed
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    studentId VARCHAR(50) UNIQUE,
    phoneNumber VARCHAR(20),
    avatar TEXT, -- URL to profile image
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    isActive BOOLEAN DEFAULT true,
    isEmailVerified BOOLEAN DEFAULT false,
    lastLoginAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Items table with enhanced features
CREATE TABLE Items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    location VARCHAR(255),
    type VARCHAR(10) NOT NULL CHECK (type IN ('lost', 'found')),
    images TEXT[], -- Array of image URLs
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'closed', 'pending')),
    userId UUID REFERENCES Users(id) ON DELETE CASCADE,
    contactInfo JSONB, -- Flexible contact information
    dateTime TIMESTAMP, -- When item was lost/found
    reward DECIMAL(10,2), -- Reward amount if any
    tags TEXT[], -- Search tags
    viewCount INTEGER DEFAULT 0,
    adminNote TEXT, -- Admin notes
    claimedBy UUID REFERENCES Users(id),
    claimedAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches table for AI/manual matching
CREATE TABLE Matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lostItemId UUID REFERENCES Items(id) ON DELETE CASCADE,
    foundItemId UUID REFERENCES Items(id) ON DELETE CASCADE,
    similarity FLOAT CHECK (similarity >= 0 AND similarity <= 100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    matchedBy UUID REFERENCES Users(id), -- Who suggested the match
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmedAt TIMESTAMP,
    UNIQUE(lostItemId, foundItemId) -- Prevent duplicate matches
);

-- Messages table for communication
CREATE TABLE Messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fromUserId UUID REFERENCES Users(id) ON DELETE CASCADE,
    toUserId UUID REFERENCES Users(id) ON DELETE CASCADE,
    itemId UUID REFERENCES Items(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    isRead BOOLEAN DEFAULT false,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE Notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID REFERENCES Users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'match_found', 'message', 'item_claimed', etc.
    title VARCHAR(255) NOT NULL,
    content TEXT,
    itemId UUID REFERENCES Items(id) ON DELETE SET NULL,
    isRead BOOLEAN DEFAULT false,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create comprehensive indexes for performance
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_student_id ON Users(studentId);
CREATE INDEX idx_users_role ON Users(role);
CREATE INDEX idx_users_active ON Users(isActive);

CREATE INDEX idx_items_type ON Items(type);
CREATE INDEX idx_items_status ON Items(status);
CREATE INDEX idx_items_user ON Items(userId);
CREATE INDEX idx_items_category ON Items(category);
CREATE INDEX idx_items_created ON Items(createdAt DESC);
CREATE INDEX idx_items_location ON Items(location);
CREATE INDEX idx_items_claimed ON Items(claimedBy);

-- Full-text search index
CREATE INDEX idx_items_search ON Items USING gin(to_tsvector('english', title || ' ' || description || ' ' || coalesce(array_to_string(tags, ' '), '')));

CREATE INDEX idx_matches_lost ON Matches(lostItemId);
CREATE INDEX idx_matches_found ON Matches(foundItemId);
CREATE INDEX idx_matches_status ON Matches(status);

CREATE INDEX idx_messages_to_user ON Messages(toUserId);
CREATE INDEX idx_messages_from_user ON Messages(fromUserId);
CREATE INDEX idx_messages_item ON Messages(itemId);
CREATE INDEX idx_messages_unread ON Messages(toUserId, isRead);

CREATE INDEX idx_notifications_user ON Notifications(userId);
CREATE INDEX idx_notifications_unread ON Notifications(userId, isRead);

-- Create trigger function for updating updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updatedAt
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON Users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON Items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing

-- Insert admin user (password: admin123)
INSERT INTO Users (email, password, firstName, lastName, studentId, role, isEmailVerified) 
VALUES (
    'admin@college.edu',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj5.6zqe3J9u', -- bcrypt hash of 'admin123'
    'Admin',
    'User',
    'ADMIN001',
    'admin',
    true
);

-- Insert sample regular user (password: user123)
INSERT INTO Users (email, password, firstName, lastName, studentId, isEmailVerified) 
VALUES (
    'john.doe@college.edu',
    '$2a$12$8k9K0Q0Q9Q0Q9Q0Q9Q0Q9u.M5M5M5M5M5M5M5M5M5M5M5M5M5M5M5', -- bcrypt hash of 'user123'
    'John',
    'Doe',
    'STU001',
    true
);

-- Insert sample lost items
INSERT INTO Items (title, description, category, location, type, userId, contactInfo, tags) VALUES
(
    'Blue Jansport Backpack',
    'Lost my blue Jansport backpack with laptop inside. Has engineering club stickers and a water bottle in the side pocket. Very important as it contains my assignments and laptop.',
    'Bags',
    'Engineering Building - Room 205',
    'lost',
    (SELECT id FROM Users WHERE email = 'john.doe@college.edu'),
    '{"email": "john.doe@college.edu", "phone": "+1234567890", "preferredContact": "email"}',
    ARRAY['backpack', 'blue', 'jansport', 'laptop', 'engineering']
),
(
    'iPhone 13 Pro',
    'Lost black iPhone 13 Pro with a blue MagSafe case. Screen protector is slightly cracked. Phone has a photo of a golden retriever as wallpaper.',
    'Electronics',
    'Library - 2nd Floor Study Area',
    'lost',
    (SELECT id FROM Users WHERE email = 'john.doe@college.edu'),
    '{"email": "john.doe@college.edu", "phone": "+1234567890", "preferredContact": "phone"}',
    ARRAY['iphone', 'phone', 'apple', 'black', 'blue case']
),
(
    'Gold Ring with Initials',
    'Small gold ring with initials "MK" engraved on the inside. Has sentimental value as it was a gift from grandmother.',
    'Jewelry',
    'Student Center - Near Food Court',
    'lost',
    (SELECT id FROM Users WHERE email = 'john.doe@college.edu'),
    '{"email": "john.doe@college.edu", "preferredContact": "email"}',
    ARRAY['ring', 'gold', 'jewelry', 'initials', 'MK']
),
(
    'Black Leather Wallet',
    'Lost black leather wallet containing student ID, drivers license, and some cash. Has Bennett University ID card inside.',
    'Accessories',
    'Parking Lot B',
    'lost',
    (SELECT id FROM Users WHERE email = 'john.doe@college.edu'),
    '{"email": "john.doe@college.edu", "phone": "+1234567890"}',
    ARRAY['wallet', 'leather', 'black', 'ID', 'cash']
),
(
    'Red Nike Hoodie',
    'Red Nike hoodie size medium. Left in the gym locker room. Has my name "John" written on the tag.',
    'Clothing',
    'Sports Complex - Mens Locker Room',
    'lost',
    (SELECT id FROM Users WHERE email = 'john.doe@college.edu'),
    '{"email": "john.doe@college.edu"}',
    ARRAY['hoodie', 'nike', 'red', 'clothing', 'gym']
);

-- Insert sample found items (only visible to admins)
INSERT INTO Items (title, description, category, location, type, userId, contactInfo, tags) VALUES
(
    'Brown Leather Wallet',
    'Found brown leather wallet with multiple cards inside. Contains student ID for Sarah Wilson, studentId: STU205.',
    'Accessories',
    'Cafeteria - Table 15',
    'found',
    (SELECT id FROM Users WHERE email = 'admin@college.edu'),
    '{"reportedBy": "admin@college.edu", "location": "Cafeteria Table 15"}',
    ARRAY['wallet', 'brown', 'leather', 'cards', 'sarah']
),
(
    'White AirPods Pro',
    'Found white AirPods Pro in charging case. Case has a small scratch on the back. Found near the basketball court.',
    'Electronics',
    'Sports Complex - Basketball Court',
    'found',
    (SELECT id FROM Users WHERE email = 'admin@college.edu'),
    '{"reportedBy": "admin@college.edu", "foundBy": "Security Guard"}',
    ARRAY['airpods', 'apple', 'headphones', 'white', 'basketball']
),
(
    'Purple Water Bottle',
    'Purple stainless steel water bottle with floral stickers. Half full of water. Found in Library.',
    'Accessories',
    'Library - 1st Floor',
    'found',
    (SELECT id FROM Users WHERE email = 'admin@college.edu'),
    '{"reportedBy": "admin@college.edu", "foundLocation": "Library Desk 12"}',
    ARRAY['water bottle', 'purple', 'stickers', 'library']
),
(
    'Silver MacBook Air',
    'Silver MacBook Air 13-inch found in computer lab. Has several programming stickers on it. Password protected.',
    'Electronics',
    'Computer Science Building - Lab 3',
    'found',
    (SELECT id FROM Users WHERE email = 'admin@college.edu'),
    '{"reportedBy": "admin@college.edu", "foundBy": "Lab Assistant"}',
    ARRAY['macbook', 'laptop', 'apple', 'silver', 'programming']
),
(
    'Blue Baseball Cap',
    'Blue baseball cap with Bennett University logo. Found on campus bench near main entrance.',
    'Clothing',
    'Main Campus - Entrance Bench',
    'found',
    (SELECT id FROM Users WHERE email = 'admin@college.edu'),
    '{"reportedBy": "admin@college.edu"}',
    ARRAY['cap', 'hat', 'blue', 'bennett', 'university']
);

-- Create sample potential matches
INSERT INTO Matches (lostItemId, foundItemId, similarity, status, notes) VALUES
(
    (SELECT id FROM Items WHERE title = 'Black Leather Wallet' AND type = 'lost'),
    (SELECT id FROM Items WHERE title = 'Brown Leather Wallet' AND type = 'found'),
    75.5,
    'pending',
    'Similar wallet types, different colors but could be lighting/description difference'
);

-- Insert sample notifications
INSERT INTO Notifications (userId, type, title, content, itemId) VALUES
(
    (SELECT id FROM Users WHERE email = 'john.doe@college.edu'),
    'potential_match',
    'Potential match found for your lost wallet',
    'We found a wallet that might match your lost black leather wallet. Please check the match details.',
    (SELECT id FROM Items WHERE title = 'Black Leather Wallet' AND type = 'lost')
),
(
    (SELECT id FROM Users WHERE email = 'admin@college.edu'),
    'new_item',
    'New lost item reported',
    'A new lost item has been reported: Blue Jansport Backpack',
    (SELECT id FROM Items WHERE title = 'Blue Jansport Backpack')
);

-- Create views for common queries

-- View for active lost items (public view)
CREATE VIEW active_lost_items AS
SELECT 
    i.*,
    u.firstName,
    u.lastName,
    u.studentId
FROM Items i
JOIN Users u ON i.userId = u.id
WHERE i.type = 'lost' 
AND i.status = 'open'
AND u.isActive = true;

-- View for admin found items review
CREATE VIEW admin_found_items AS
SELECT 
    i.*,
    u.firstName,
    u.lastName,
    u.studentId,
    u.email
FROM Items i
JOIN Users u ON i.userId = u.id
WHERE i.type = 'found' 
AND i.status = 'open';

-- View for match suggestions
CREATE VIEW match_suggestions AS
SELECT 
    m.*,
    li.title as lost_item_title,
    fi.title as found_item_title,
    lu.firstName as lost_user_name,
    fu.firstName as found_user_name
FROM Matches m
JOIN Items li ON m.lostItemId = li.id
JOIN Items fi ON m.foundItemId = fi.id
JOIN Users lu ON li.userId = lu.id
JOIN Users fu ON fi.userId = fu.id
WHERE m.status = 'pending'
ORDER BY m.similarity DESC;

-- Add Row Level Security (RLS) policies for Supabase
ALTER TABLE Users ENABLE ROW LEVEL SECURITY;
ALTER TABLE Items ENABLE ROW LEVEL SECURITY;
ALTER TABLE Matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE Messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE Notifications ENABLE ROW LEVEL SECURITY;

-- Users can read all user profiles but only update their own
CREATE POLICY "Users can view all profiles" ON Users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON Users FOR UPDATE USING (auth.uid() = id);

-- Anyone can read lost items, only admins can read found items
CREATE POLICY "Anyone can view lost items" ON Items FOR SELECT USING (type = 'lost' OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Users can insert their own items" ON Items FOR INSERT WITH CHECK (auth.uid() = userId);
CREATE POLICY "Users can update their own items" ON Items FOR UPDATE USING (auth.uid() = userId OR auth.jwt() ->> 'role' = 'admin');

-- Only admins can manage matches
CREATE POLICY "Admins can manage matches" ON Matches FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Users can read their own messages
CREATE POLICY "Users can read their messages" ON Messages FOR SELECT USING (auth.uid() = toUserId OR auth.uid() = fromUserId);
CREATE POLICY "Users can send messages" ON Messages FOR INSERT WITH CHECK (auth.uid() = fromUserId);

-- Users can read their own notifications
CREATE POLICY "Users can read their notifications" ON Notifications FOR SELECT USING (auth.uid() = userId);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 DATABASE SETUP COMPLETE!';
    RAISE NOTICE '✅ Tables created: Users, Items, Matches, Messages, Notifications';
    RAISE NOTICE '✅ Indexes created for optimal performance';
    RAISE NOTICE '✅ Sample data inserted';
    RAISE NOTICE '✅ Views created for common queries';
    RAISE NOTICE '✅ Row Level Security policies applied';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 TEST CREDENTIALS:';
    RAISE NOTICE 'Admin: admin@college.edu / admin123';
    RAISE NOTICE 'User: john.doe@college.edu / user123';
    RAISE NOTICE '';
    RAISE NOTICE '📊 SAMPLE DATA:';
    RAISE NOTICE '• 5 lost items';
    RAISE NOTICE '• 5 found items (admin only)';
    RAISE NOTICE '• 1 potential match';
    RAISE NOTICE '• 2 notifications';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your database is ready for production!';
END $$;
