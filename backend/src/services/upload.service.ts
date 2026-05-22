import fs from 'fs';
import { parse } from 'csv-parse';
import * as xlsx from 'xlsx';
import db from '../config/db';

class UploadService {
    static async parseProducts(filePath: string, fileType: string): Promise<any[]> {
        if (fileType === 'csv') {
            return this.parseCSV(filePath);
        } else if (fileType === 'xlsx' || fileType === 'xls') {
            return this.parseExcel(filePath);
        }
        throw new Error('Unsupported file type');
    }

    private static parseCSV(filePath: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const products: any[] = [];
            fs.createReadStream(filePath)
                .pipe(parse({ columns: true, skip_empty_lines: true }))
                .on('data', (row) => {
                    products.push(this.mapRowToProduct(row));
                })
                .on('end', () => resolve(products))
                .on('error', (err) => reject(err));
        });
    }

    private static parseExcel(filePath: string): any[] {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(sheet);
        return rows.map(row => this.mapRowToProduct(row));
    }

    private static mapRowToProduct(row: any) {
        return {
            name: row['Product Name'] || row['name'],
            category: row['Category'] || row['category'],
            nafdac_number: row['NAFDAC Number'] || row['nafdac_number'],
            manufacturer: row['Manufacturer'] || row['manufacturer'],
            description: row['Description'] || row['description'],
            active_ingredients: row['Active Ingredients'] || row['active_ingredients'],
            product_form: row['Form'] || row['product_form'],
            route_of_administration: row['ROA'] || row['route_of_administration'],
            strength: row['Strength'] || row['strength'],
            applicant_name: row['Applicant'] || row['applicant_name'],
            country_of_origin: row['Country'] || row['country_of_origin'],
            approval_date: row['Approval Date'] || row['approval_date'],
            expiry_date: row['Expiry Date'] || row['expiry_date'],
            presentation: row['Presentation'] || row['presentation'],
            master_image_url: row['Image URL'] || row['image_url']
        };
    }

    static async insertBulk(products: any[]) {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');
            const query = `
                INSERT INTO products (
                    name, category, nafdac_number, manufacturer, description, 
                    active_ingredients, product_form, route_of_administration, 
                    strength, applicant_name, country_of_origin, approval_date, 
                    expiry_date, presentation, master_image_url
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                ON CONFLICT (nafdac_number) DO UPDATE SET
                    name = EXCLUDED.name,
                    category = EXCLUDED.category,
                    manufacturer = EXCLUDED.manufacturer,
                    description = EXCLUDED.description,
                    active_ingredients = EXCLUDED.active_ingredients,
                    product_form = EXCLUDED.product_form,
                    route_of_administration = EXCLUDED.route_of_administration,
                    strength = EXCLUDED.strength,
                    applicant_name = EXCLUDED.applicant_name,
                    country_of_origin = EXCLUDED.country_of_origin,
                    approval_date = EXCLUDED.approval_date,
                    expiry_date = EXCLUDED.expiry_date,
                    presentation = EXCLUDED.presentation,
                    master_image_url = EXCLUDED.master_image_url
            `;

            for (const p of products) {
                await client.query(query, [
                    p.name, p.category, p.nafdac_number, p.manufacturer, p.description,
                    p.active_ingredients, p.product_form, p.route_of_administration,
                    p.strength, p.applicant_name, p.country_of_origin, p.approval_date,
                    p.expiry_date, p.presentation, p.master_image_url
                ]);
            }
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
}

export default UploadService;
