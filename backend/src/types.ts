export type UserRole = 'ADMIN' | 'USER' | 'RESEARCHER';

export interface User {
    id: string;
    username: string;
    email: string;
    password_hash: string;
    role: 'USER' | 'ADMIN' | 'EDITOR';
    is_banned: boolean;
    failed_login_attempts?: number;
    locked_until?: Date | string;
    mfa_enabled?: boolean;
    mfa_secret?: string;
    refresh_token?: string;
    token_version?: number;
    created_at: Date;
}

export interface Product {
    id: number | string;
    name: string;
    category: string;
    nafdac_number: string;
    manufacturer: string;
    description: string;
    status: 'VERIFIED' | 'SUSPICIOUS' | 'FAKES_CIRC' | 'PENDING';
    created_at: Date;
    // Extended Fields
    active_ingredients?: string;
    product_form?: string;
    route_of_administration?: string;
    strength?: string;
    applicant_name?: string;
    country_of_origin?: string;
    approval_date?: Date;
    expiry_date?: Date;
    presentation?: string;
    is_registered: boolean;
    registration_status: string;
    has_safety_alert: boolean;
    alert_details?: string;
    master_image_url?: string;
}

export interface Recall {
    id: number;
    product_id: number;
    nafdac_number: string;
    reason: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    category: string;
    recall_date: Date;
    status: 'ACTIVE' | 'RESOLVED';
    affected_batches: string[];
}

export interface Comment {
    id: string;
    user_id: string;
    product_id: string;
    content: string;
    flagged: boolean;
    created_at: Date;
}

export interface ProductBatch {
    id: string;
    product_id: number | string;
    batch_number: string;
    expiry_date: Date;
    created_at: Date;
}

export interface Submission {
    id: string;
    submitted_by: string;
    product_name: string;
    nafdac_number: string;
    image_urls: string[];
    user_notes: string;
    status: 'PENDING' | 'REVIEWED';
    reviewed_by?: string;
    review_notes?: string;
    created_at: Date;
    reviewed_at?: Date;
}
