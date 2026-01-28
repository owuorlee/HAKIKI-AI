/**
 * TypeScript types for HAKIKI AI v2.0 Frontend
 */

// Graph visualization types
export interface GraphNode {
    id: string;
    name: string;
    type: 'employee' | 'bank' | 'department' | 'device';
    val?: number;
    color?: string;
    salary?: number;
    fraudType?: string;
}

export interface GraphLink {
    source: string;
    target: string;
    type: 'DEPOSITS_TO' | 'WORKS_AT' | 'USES_DEVICE';
}

export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

// Audit response types
export interface AuditResponse {
    status: string;
    message: string;
    etl_summary?: {
        records_loaded: number;
        employees: number;
        bank_accounts: number;
        departments: number;
    };
    ghost_families_detected: number;
    identity_theft_detected: number;
    living_dead_detected: number;
    total_flags: number;
    at_risk_amount: number;
    details?: AuditDetails;
    top_suspects?: any[];
}

export interface AuditDetails {
    ghost_families: FraudCategory;
    identity_theft: FraudCategory;
    living_dead: FraudCategory;
}

export interface FraudCategory {
    fraud_type: string;
    description: string;
    suspicious_accounts?: number;
    duplicate_pins?: number;
    cases?: number;
    total_affected_employees?: number;
    total_salary_at_risk?: number;
    details: any[];
}

// ML anomaly types
export interface SalaryAnomaly {
    employee_id: string;
    name: string;
    national_id: string;
    job_group: string;
    department?: string;
    basic_salary: number;
    gross_salary: number;
    anomaly_score: number;
    // Variance fix fields
    risk_score?: number;
    group_mean?: number;
    sigma_val?: number;
}

export interface MLResponse {
    status: string;
    anomalies_detected: number;
    total_salary_at_risk: number;
    anomalies: SalaryAnomaly[];
}

// Oracle types
export interface OracleResponse {
    status: string;
    entities: {
        persons: string[];
        departments: string[];
    };
    fraud_type: string;
    confidence: number;
    raw_response?: string;
}

// Dashboard stats
export interface DashboardStats {
    totalEmployees: number;
    totalFlags: number;
    ghostFamilies: number;
    identityTheft: number;
    livingDead: number;
    salaryAnomalies: number;
    totalAtRisk: number;
}
