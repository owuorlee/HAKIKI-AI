"""
Stop Order PDF Generator for HAKIKI AI v2.0
Generates legally formatted Stop Payment Orders for salary freezing.
"""
from fpdf import FPDF
from datetime import datetime
import os
from pathlib import Path


class StopOrderGenerator:
    """
    Generates official Stop Payment Order PDFs.
    Format follows Kenya Public Finance Management Act requirements.
    """
    
    def __init__(self):
        self.output_dir = Path(__file__).parent.parent.parent / "data" / "stop_orders"
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def create_pdf(self, suspect: dict) -> str:
        """
        Generate a Stop Payment Order PDF for a suspect.
        
        Args:
            suspect: Dictionary containing:
                - full_name: Employee's full name
                - national_id: National ID number
                - employee_id: Employee ID
                - fraud_reason: Description of the fraud
                - amount_at_risk: Salary amount to freeze
                - job_group: Job group classification
                - department: Department name
        
        Returns:
            Path to the generated PDF file
        """
        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)
        
        # Header - Republic of Kenya
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 10, "REPUBLIC OF KENYA", ln=True, align="C")
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 8, "OFFICE OF THE AUDITOR GENERAL", ln=True, align="C")
        pdf.ln(5)
        
        # Horizontal line
        pdf.set_draw_color(0, 100, 0)
        pdf.set_line_width(1)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(10)
        
        # Title
        pdf.set_font("Arial", "B", 18)
        pdf.set_text_color(180, 0, 0)
        pdf.cell(0, 12, "STOP PAYMENT ORDER", ln=True, align="C")
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 8, "- IMMEDIATE EFFECT -", ln=True, align="C")
        pdf.set_text_color(0, 0, 0)
        pdf.ln(10)
        
        # Reference and Date
        timestamp = datetime.now()
        ref_number = f"HAKIKI/SPO/{timestamp.strftime('%Y%m%d')}/{suspect.get('employee_id', 'UNKNOWN')[-6:]}"
        
        pdf.set_font("Arial", "", 11)
        pdf.cell(0, 6, f"Reference: {ref_number}", ln=True)
        pdf.cell(0, 6, f"Date: {timestamp.strftime('%d %B %Y')}", ln=True)
        pdf.ln(8)
        
        # Legal Basis
        pdf.set_font("Arial", "B", 11)
        pdf.cell(0, 6, "LEGAL BASIS:", ln=True)
        pdf.set_font("Arial", "", 10)
        pdf.multi_cell(0, 5, 
            "Pursuant to Section 4 of the Public Finance Management Act, 2012, "
            "and Section 68 of the Constitution of Kenya, the Auditor General hereby "
            "orders the immediate suspension of salary payments to the individual named below, "
            "pending investigation of suspected payroll fraud."
        )
        pdf.ln(8)
        
        # Suspect Details Table
        pdf.set_font("Arial", "B", 11)
        pdf.cell(0, 6, "SUBJECT OF ORDER:", ln=True)
        pdf.ln(3)
        
        # Table header
        pdf.set_fill_color(240, 240, 240)
        pdf.set_font("Arial", "B", 10)
        
        details = [
            ("Full Name", suspect.get("full_name", "N/A")),
            ("National ID", suspect.get("national_id", "N/A")),
            ("Employee ID", suspect.get("employee_id", "N/A")),
            ("Job Group", suspect.get("job_group", "N/A")),
            ("Department", suspect.get("department", "N/A")),
            ("Monthly Salary (KES)", f"{suspect.get('amount_at_risk', 0):,.2f}"),
        ]
        
        for label, value in details:
            pdf.set_font("Arial", "B", 10)
            pdf.cell(60, 8, label, border=1, fill=True)
            pdf.set_font("Arial", "", 10)
            pdf.cell(0, 8, str(value), border=1, ln=True)
        
        pdf.ln(8)
        
        # Fraud Details
        pdf.set_font("Arial", "B", 11)
        pdf.set_text_color(180, 0, 0)
        pdf.cell(0, 6, "FRAUD CLASSIFICATION:", ln=True)
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Arial", "", 10)
        
        fraud_reason = suspect.get("fraud_reason", "Salary Padding - Statistical anomaly detected by ML analysis")
        pdf.multi_cell(0, 5, fraud_reason)
        pdf.ln(8)
        
        # Action Required
        pdf.set_font("Arial", "B", 11)
        pdf.cell(0, 6, "ACTION REQUIRED:", ln=True)
        pdf.set_font("Arial", "", 10)
        pdf.multi_cell(0, 5,
            "1. The Accounting Officer shall immediately suspend all salary payments to the named individual.\n"
            "2. The Human Resources Department shall place the employee on administrative leave.\n"
            "3. The Ethics and Anti-Corruption Commission (EACC) shall be notified within 48 hours.\n"
            "4. All relevant payroll records shall be preserved for forensic audit."
        )
        pdf.ln(10)
        
        # Footer
        pdf.set_draw_color(0, 100, 0)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(5)
        
        pdf.set_font("Arial", "I", 9)
        pdf.set_text_color(100, 100, 100)
        pdf.cell(0, 5, f"Generated by HAKIKI AI Sovereign Engine", ln=True, align="C")
        pdf.cell(0, 5, f"Timestamp: {timestamp.strftime('%Y-%m-%d %H:%M:%S EAT')}", ln=True, align="C")
        pdf.cell(0, 5, "This document is computer-generated and requires authorized signature.", ln=True, align="C")
        
        # Save PDF
        filename = f"StopOrder_{suspect.get('employee_id', 'UNKNOWN')}_{timestamp.strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = self.output_dir / filename
        pdf.output(str(filepath))
        
        print(f"[SUCCESS] Stop Order generated: {filepath}")
        return str(filepath)
