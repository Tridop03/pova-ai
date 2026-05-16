import aiService from './ai.service';
import Product from '../models/product.model';
import BatchModel from '../models/batch.model';
import blockchainService from './blockchain.service';

class VerifyService {
    static async verifyProduct(images: string[], productId: string | null = null): Promise<any> {
        // 1. Send images to AI Service for OCR and analysis
        const aiResult = await aiService.analyzeImages(images, productId);
        const { nafdac_number, batch_number, expiry_date, verdict, confidence } = aiResult;

        // 2. Lookup NAFDAC number in our database
        const dbProduct = await Product.findByNafdac(nafdac_number);

        let finalVerdict = verdict;
        let details = null;
        let batchValidation = {
            verified: false,
            message: 'Batch information not found/validated'
        };

        if (!dbProduct) {
            finalVerdict = 'NOT_FOUND_IN_REGISTRY';
        } else {
            // New: Check Registration Status
            if (dbProduct.is_registered === false) {
                finalVerdict = 'UNREGISTERED_OR_BANNED';
                batchValidation.message = `NAFDAC Status: ${dbProduct.registration_status || 'Inactive'}`;
            }

            // New: Check for Active Safety Alerts
            if (dbProduct.has_safety_alert) {
                finalVerdict = 'CRITICAL_SAFETY_ALERT';
                batchValidation.message = `ALERT: ${dbProduct.alert_details}`;
            }

            // Existing: Check if product is in fakes_circ
            if (dbProduct.status === 'FAKES_CIRC' && finalVerdict !== 'CRITICAL_SAFETY_ALERT') {
                finalVerdict = 'AUTHENTICITY_WARNING';
            }
            
            // Validate Batch & Expiry
            if (batch_number) {
                const dbBatch = await BatchModel.findByBatchNumber(dbProduct.id, batch_number);
                if (dbBatch) {
                    batchValidation.verified = true;
                    batchValidation.message = 'Valid registered batch';
                    
                    // Cross-check expiry date if found
                    if (expiry_date) {
                        const aiExp = expiry_date.replace(/[/-]/g, '');
                        const dbExp = new Date(dbBatch.expiry_date).toISOString().split('T')[0].replace(/[/-]/g, '');
                        
                        if (!aiExp.includes(dbExp.substring(0, 7)) && !dbExp.includes(aiExp.substring(0, 7))) {
                            batchValidation.verified = false;
                            batchValidation.message = 'Expiry date mismatch for this batch';
                            finalVerdict = 'SUSPICIOUS_BATCH_EXPIRY';
                        }
                    }
                } else if (finalVerdict !== 'CRITICAL_SAFETY_ALERT' && finalVerdict !== 'UNREGISTERED_OR_BANNED') {
                    batchValidation.message = 'Batch number not found in our records for this product';
                    finalVerdict = 'UNRECOGNIZED_BATCH';
                }
            }

            details = await Product.getDetails(dbProduct.id);
        }

        // 3. Log to Blockchain
        const chainResult = await blockchainService.logVerdict(nafdac_number, finalVerdict, confidence);

        return {
            nafdacNumber: nafdac_number,
            batchNumber: batch_number,
            expiryDate: expiry_date,
            batchValidation,
            verdict: finalVerdict,
            confidence,
            product: details,
            variants: details?.variants || [],
            blockchain: chainResult,
        };
    }
}

export default VerifyService;
