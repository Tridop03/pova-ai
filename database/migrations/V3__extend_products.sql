-- Add new columns to products table
ALTER TABLE products ADD COLUMN active_ingredients TEXT;
ALTER TABLE products ADD COLUMN product_form VARCHAR(255);
ALTER TABLE products ADD COLUMN route_of_administration VARCHAR(255);
ALTER TABLE products ADD COLUMN strength VARCHAR(255);
ALTER TABLE products ADD COLUMN applicant_name VARCHAR(255);
ALTER TABLE products ADD COLUMN country_of_origin VARCHAR(255);
ALTER TABLE products ADD COLUMN approval_date DATE;
ALTER TABLE products ADD COLUMN expiry_date DATE;
ALTER TABLE products ADD COLUMN presentation TEXT;
ALTER TABLE products ADD COLUMN is_registered BOOLEAN DEFAULT TRUE;
ALTER TABLE products ADD COLUMN registration_status VARCHAR(100) DEFAULT 'REGISTERED';
ALTER TABLE products ADD COLUMN has_safety_alert BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN alert_details TEXT;
ALTER TABLE products ADD COLUMN master_image_url TEXT;

-- Update product_category enum if needed (it already has many, but let's ensure it's robust)
-- Already includes: 'DRUG', 'SKINCARE', 'FOOD', 'MEDICAL_DEVICES', 'COSMETICS', 'VACCINES', 'CHEMICALS', 'BEVERAGES', 'SUPPLEMENTS'
