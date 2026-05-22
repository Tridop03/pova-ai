-- V4__add_product_variants.sql

-- A table to handle specific flavors, sizes, or packaging variations of a NAFDAC registered product
CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    variant_name VARCHAR(255) NOT NULL, -- e.g., "Chicken Flavor", "Family Pack", "New 2026 Design"
    flavor VARCHAR(100),
    packaging_type VARCHAR(100), -- e.g., "Sachet", "Carton", "Bottle"
    size_weight VARCHAR(50), -- e.g., "70g", "120g"
    master_image_url TEXT, -- Specific master image for this variant
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update updated_at
CREATE TRIGGER update_product_variants_modtime
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Add a column to pkg_images to link to a specific variant if needed
ALTER TABLE pkg_images ADD COLUMN variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL;

-- Initial data migration: Create a default variant for existing products that have a master_image_url
INSERT INTO product_variants (product_id, variant_name, master_image_url)
SELECT id, 'Default/Original', master_image_url 
FROM products 
WHERE master_image_url IS NOT NULL;
