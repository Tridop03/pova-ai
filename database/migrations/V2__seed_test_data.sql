-- SEED DATA FOR TESTING

-- 1. Create an Admin User
INSERT INTO users (username, email, password_hash, role)
VALUES ('admin', 'admin@pova.ai', '$2b$10$YourHashedPasswordHere', 'ADMIN');

-- 2. Create Genuine Products
INSERT INTO products (name, category, nafdac_number, manufacturer, description, status)
VALUES 
('Paracetamol 500mg', 'DRUG', 'A1-1234', 'Emzor Pharmaceuticals', 'Standard pain reliever', 'VERIFIED'),
('Glow Skin Serum', 'SKINCARE', 'B2-5678', 'ClearBeauty Inc', 'Vitamin C based serum', 'VERIFIED'),
('Tomato Paste 70g', 'FOOD', 'C3-9012', 'TastyFoods Ltd', 'Double concentrated tomato paste', 'VERIFIED');

-- 3. Create a Product with Known Fakes
INSERT INTO products (name, category, nafdac_number, manufacturer, description, status)
VALUES ('Amlodipine 5mg', 'DRUG', 'D4-4321', 'Pfizer', 'Blood pressure medication', 'FAKES_CIRC');

INSERT INTO fake_versions (product_id, description, differences)
VALUES (
    (SELECT id FROM products WHERE nafdac_number = 'D4-4321'),
    'Counterfeit packaging found in Lagos market',
    '{"font": "Slightly taller", "color": "Darker blue", "seal": "Missing hologram"}'
);

-- 4. Create a Recalled Product
INSERT INTO recalled_products (product_id, nafdac_number, reason, severity, category, recall_date, status, affected_batches)
VALUES (
    (SELECT id FROM products WHERE nafdac_number = 'C3-9012'),
    'C3-9012',
    'Detected high levels of lead in batch 001',
    'HIGH',
    'FOOD',
    '2024-04-20',
    'ACTIVE',
    '["B001", "B002"]'
);
