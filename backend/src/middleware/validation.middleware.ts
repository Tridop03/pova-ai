import Joi, { Schema } from 'joi';
import { Request, Response, NextFunction } from 'express';
import response from '../utils/apiResponse';
import rateLimit from 'express-rate-limit';

export const validate = (schema: Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map(detail => detail.message);
            return response.error(res, 'Validation failed', 400, errors);
        }
        next();
    };
};

export const adminLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Limit each IP to 50 requests per hour for admin actions
    message: 'Too many admin actions from this IP, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
});

export const productSchema = Joi.object({
    name: Joi.string().required().min(3),
    category: Joi.string().required(),
    nafdac_number: Joi.string().required().pattern(/^[A-Z0-9]{2}-[0-9]{4,6}$/),
    manufacturer: Joi.string().required(),
    description: Joi.string().optional().allow(''),
    active_ingredients: Joi.string().optional().allow(''),
    product_form: Joi.string().optional().allow(''),
    route_of_administration: Joi.string().optional().allow(''),
    strength: Joi.string().optional().allow(''),
    applicant_name: Joi.string().optional().allow(''),
    country_of_origin: Joi.string().optional().allow(''),
    approval_date: Joi.date().optional(),
    expiry_date: Joi.date().optional(),
    presentation: Joi.string().optional().allow(''),
    is_registered: Joi.boolean().optional(),
    registration_status: Joi.string().optional(),
    has_safety_alert: Joi.boolean().optional(),
    alert_details: Joi.string().optional().allow(''),
    master_image_url: Joi.string().uri().optional().allow('')
});

export const banUserSchema = Joi.object({
    is_banned: Joi.boolean().required()
});

export const updateRoleSchema = Joi.object({
    role: Joi.string().valid('USER', 'ADMIN', 'EDITOR').required()
});

export const recallSchema = Joi.object({
    product_id: Joi.string().required(),
    nafdac_number: Joi.string().required(),
    reason: Joi.string().required(),
    severity: Joi.string().valid('HIGH', 'MEDIUM', 'LOW').required(),
    category: Joi.string().required(),
    recall_date: Joi.date().required(),
    status: Joi.string().valid('ACTIVE', 'RESOLVED').optional(),
    affected_batches: Joi.array().items(Joi.string()).optional(),
    added_by: Joi.string().optional(),
    notes: Joi.string().optional().allow('')
});
