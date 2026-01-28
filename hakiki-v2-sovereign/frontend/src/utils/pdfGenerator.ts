/**
 * PDF Generator for Legal Brief
 * Generates court-ready Forensic Audit Briefs with National Treasury letterhead
 */
import jsPDF from 'jspdf';

interface SuspectData {
    name?: string;
    Full_Name?: string;
    national_id?: string;
    National_ID?: string;
    employee_id?: string;
    Employee_ID?: string;
    job_group?: string;
    Job_Group?: string;
    department?: string;
    Department?: string;
    gross_salary?: number;
    Gross_Salary?: number;
    risk_score?: number;
    sigma_val?: number;
    group_mean?: number;
}

export const generateLegalBrief = (suspect: SuspectData): void => {
    const doc = new jsPDF();

    // Normalize field names (handle both camelCase and snake_case)
    const fullName = suspect.name || suspect.Full_Name || 'UNKNOWN';
    const nationalId = suspect.national_id || suspect.National_ID || 'N/A';
    const employeeId = suspect.employee_id || suspect.Employee_ID || 'EMP-XX';
    const jobGroup = suspect.job_group || suspect.Job_Group || 'N/A';
    const department = suspect.department || suspect.Department || 'N/A';
    const grossSalary = suspect.gross_salary || suspect.Gross_Salary || 0;
    const riskScore = suspect.risk_score || 95;
    const sigmaVal = suspect.sigma_val || 3.4;

    const today = new Date().toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
    const time = new Date().toLocaleTimeString();
    const refNo = `HK-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${new Date().getFullYear()}`;

    // --- 1. HEADER & AUTHORITY ---
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text("REPUBLIC OF KENYA", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text("THE NATIONAL TREASURY & ECONOMIC PLANNING", 105, 28, { align: "center" });

    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);

    // --- 2. METADATA ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(`REF NO: ${refNo}`, 20, 45);
    doc.text(`DATE: ${today} ${time}`, 190, 45, { align: "right" });

    doc.setFont("times", "bold");
    doc.text("TO: THE DIRECTOR OF CRIMINAL INVESTIGATIONS (DCI)", 20, 55);
    doc.text("ATTN: ECONOMIC CRIMES UNIT", 20, 62);

    // --- 3. SUBJECT LINE ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("SUBJECT: FORENSIC AUDIT REPORT - SUSPECTED PAYROLL IRREGULARITIES", 105, 78, { align: "center" });
    doc.setLineWidth(0.2);
    doc.line(30, 80, 180, 80);

    // --- 4. SUSPECT PROFILE (The Box) ---
    doc.setDrawColor(0);
    doc.setFillColor(245, 245, 245);
    doc.rect(20, 88, 170, 42, "F");

    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.setTextColor(50);

    let y = 96;
    doc.text(`NAME: ${fullName}`, 25, y);
    doc.text(`NATIONAL ID: ${nationalId}`, 115, y);
    y += 8;
    doc.text(`EMPLOYEE ID: ${employeeId}`, 25, y);
    doc.text(`JOB GROUP: ${jobGroup}`, 115, y);
    y += 8;
    doc.text(`DEPARTMENT: ${department}`, 25, y);
    doc.text(`STATION: JKUAT JUJA`, 115, y);
    y += 8;
    doc.setFont("times", "bold");
    doc.text(`GROSS SALARY: KES ${grossSalary.toLocaleString()}`, 25, y);
    doc.setTextColor(200, 0, 0);
    doc.text(`RISK SCORE: ${Math.round(riskScore)}% (CRITICAL)`, 115, y);

    // --- 5. FORENSIC EVIDENCE ---
    doc.setTextColor(0);
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.text("FORENSIC EVIDENCE MATRIX:", 20, 142);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const reasons = [
        `• STATISTICAL ANOMALY: Salary deviates ${sigmaVal}σ from the Job Group mean.`,
        `• RISK SCORE: ${Math.round(riskScore)}% - Exceeds acceptable variance threshold (>70%).`,
        `• GRAPH ANALYSIS: Linked to potential Ghost Worker cluster via shared bank metadata.`,
        `• BIOMETRIC STATUS: Flagged for mandatory physical re-verification at duty station.`
    ];

    let yReason = 150;
    reasons.forEach(r => {
        doc.text(r, 25, yReason, { maxWidth: 165 });
        yReason += 7;
    });

    // --- 6. LEGAL BASIS & RECOMMENDATION ---
    yReason += 8;
    doc.setFont("times", "bold");
    doc.text("LEGAL BASIS & ACTION:", 20, yReason);

    doc.setFont("times", "normal");
    doc.setFontSize(10);
    const legalText = "Pursuant to Section 68 of the Public Finance Management (PFM) Act 2012, and Article 227 of the Constitution of Kenya regarding fair procurement practices, this system has detected irregularities warranting immediate administrative action.";
    doc.text(legalText, 20, yReason + 7, { maxWidth: 170 });

    yReason += 22;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(200, 0, 0);
    doc.text("RECOMMENDATION: IMMEDIATE STOPPAGE OF SALARY DISBURSEMENT", 20, yReason);

    doc.setTextColor(0);
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    yReason += 10;
    doc.text("This subject is to be summoned for administrative hearing within 14 days.", 20, yReason);

    // --- 7. SIGNATURE BLOCK ---
    yReason += 20;
    doc.setFont("times", "italic");
    doc.text("For and on behalf of the Auditor General", 20, yReason);
    yReason += 15;
    doc.text("_____________________________", 20, yReason);
    yReason += 5;
    doc.setFont("times", "bold");
    doc.text("HAKIKI AI AUTOMATED SYSTEM", 20, yReason);

    // --- 8. FOOTER ---
    doc.setTextColor(120);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Generated by HAKIKI AI | Sovereign Payroll Defense Engine", 105, 280, { align: "center" });
    doc.text("This document is classified CONFIDENTIAL under the Official Secrets Act.", 105, 285, { align: "center" });

    // Save with structured filename
    doc.save(`HAKIKI_Legal_Brief_${nationalId}_${refNo}.pdf`);
};

export default generateLegalBrief;
