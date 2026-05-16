-- ENUMS
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE product_category AS ENUM ('DRUG', 'SKINCARE', 'FOOD', 'MEDICAL_DEVICES', 'COSMETICS', 'VACCINES', 'CHEMICALS', 'BEVERAGES', 'SUPPLEMENTS');
CREATE TYPE product_status AS ENUM ('VERIFIED', 'FAKES_CIRC');
CREATE TYPE recall_severity AS ENUM ('HIGH', 'MEDIUM', 'LOW');
CREATE TYPE recall_status AS ENUM ('ACTIVE', 'RESOLVED');
CREATE TYPE submission_status AS ENUM ('PENDING', 'REVIEWED');
CREATE TYPE game_difficulty AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- TABLES
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'USER',
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category product_category NOT NULL,
    nafdac_number VARCHAR(100) UNIQUE NOT NULL,
    manufacturer VARCHAR(255),
    description TEXT,
    status product_status DEFAULT 'VERIFIED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fake_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    description TEXT,
    differences JSONB,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pkg_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type VARCHAR(50), -- e.g., 'front', 'back', 'seal'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recalled_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    nafdac_number VARCHAR(100),
    reason TEXT,
    severity recall_severity,
    category product_category,
    recall_date DATE,
    status recall_status DEFAULT 'ACTIVE',
    affected_batches JSONB,
    added_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    product_name TEXT,
    nafdac_number VARCHAR(100),
    image_urls JSONB,
    user_notes TEXT,
    status submission_status DEFAULT 'PENDING',
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE game_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    genuine_prod_id UUID REFERENCES products(id),
    fake_version_id UUID REFERENCES fake_versions(id),
    correct_answer VARCHAR(255),
    explanation TEXT,
    difficulty game_difficulty DEFAULT 'MEDIUM'
);

CREATE TABLE user_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    total_points INT DEFAULT 0,
    badges JSONB DEFAULT '[]',
    rank INT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TRIGGERS FOR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recalled_products_updated_at BEFORE UPDATE ON recalled_products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_scores_updated_at BEFORE UPDATE ON user_scores FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
