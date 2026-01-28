"""
GhostHunter - Forensic Fraud Detection Engine for HAKIKI AI v2.0
Detects payroll fraud patterns using Neo4j graph queries.
"""
from typing import List, Dict, Any
from app.core.database import get_neo4j_client


class GhostHunter:
    """
    Forensic engine for detecting payroll fraud patterns in graph data.
    Uses Neo4j Cypher queries to identify anomalies.
    """
    
    def __init__(self):
        self.client = get_neo4j_client()
    
    def detect_ghost_families(self, min_employees: int = 2) -> Dict[str, Any]:
        """
        Detect Ghost Families - Bank accounts shared by multiple employees.
        
        This is a key indicator of payroll fraud where multiple "ghost workers"
        funnel salaries to a single mule account.
        
        Args:
            min_employees: Minimum number of employees sharing an account to flag
            
        Returns:
            Dict with count and detailed list of suspicious accounts
        """
        query = """
        MATCH (e:Employee)-[:DEPOSITS_TO]->(b:BankAccount)
        WITH b, COLLECT(e.name) AS employee_names, COLLECT(e.national_id) AS national_ids, COUNT(e) AS employee_count
        WHERE employee_count >= $min_employees
        RETURN b.account_number AS account_number,
               b.bank_name AS bank_name,
               employee_count,
               employee_names,
               national_ids
        ORDER BY employee_count DESC
        """
        
        results = self.client.run_query(query, {"min_employees": min_employees})
        
        # Calculate total affected employees
        total_affected = sum(r["employee_count"] for r in results)
        
        return {
            "fraud_type": "Ghost Family (Shared Bank Account)",
            "description": "Multiple employees depositing to the same bank account",
            "suspicious_accounts": len(results),
            "total_affected_employees": total_affected,
            "details": results
        }
    
    def detect_identity_theft(self) -> Dict[str, Any]:
        """
        Detect Identity Theft - KRA PINs shared by multiple employee records.
        
        A legitimate KRA PIN should only belong to one person. Duplicates
        indicate either data entry errors or identity theft.
        
        Returns:
            Dict with count and detailed list of duplicate KRA PINs
        """
        query = """
        MATCH (e:Employee)
        WITH e.kra_pin AS kra_pin, COLLECT(e.name) AS employee_names, 
             COLLECT(e.national_id) AS national_ids, COUNT(e) AS duplicate_count
        WHERE duplicate_count > 1
        RETURN kra_pin,
               duplicate_count,
               employee_names,
               national_ids
        ORDER BY duplicate_count DESC
        """
        
        results = self.client.run_query(query)
        
        # Calculate total affected employees
        total_affected = sum(r["duplicate_count"] for r in results)
        
        return {
            "fraud_type": "Identity Theft (Duplicate KRA PIN)",
            "description": "Multiple employee records sharing the same KRA PIN",
            "duplicate_pins": len(results),
            "total_affected_employees": total_affected,
            "details": results
        }
    
    def detect_living_dead(self) -> Dict[str, Any]:
        """
        Detect Living Dead - Employees with 'DECEASED' in name but still active.
        
        Returns:
            Dict with count and list of deceased but active employees
        """
        query = """
        MATCH (e:Employee)
        WHERE e.name CONTAINS 'DECEASED' OR e.name CONTAINS 'RETIRED'
        RETURN e.employee_id AS employee_id,
               e.name AS name,
               e.national_id AS national_id,
               e.kra_pin AS kra_pin,
               e.gross_salary AS salary,
               e.status AS status
        ORDER BY e.gross_salary DESC
        """
        
        results = self.client.run_query(query)
        total_salary = sum(r["salary"] for r in results if r["salary"])
        
        return {
            "fraud_type": "Living Dead (Deceased/Retired Still Active)",
            "description": "Employees marked as deceased or retired but still on payroll",
            "cases": len(results),
            "total_salary_at_risk": total_salary,
            "details": results
        }
    
    def run_full_audit(self) -> Dict[str, Any]:
        """
        Run complete forensic audit across all fraud detection methods.
        
        Returns:
            Comprehensive audit report with all findings
        """
        print("🔍 HAKIKI Sovereign Audit - Starting Full Forensic Scan...")
        
        # Run all detection methods
        ghost_families = self.detect_ghost_families()
        print(f"   👻 Ghost Families: {ghost_families['suspicious_accounts']} accounts flagged")
        
        identity_theft = self.detect_identity_theft()
        print(f"   🆔 Identity Theft: {identity_theft['duplicate_pins']} duplicate PINs found")
        
        living_dead = self.detect_living_dead()
        print(f"   💀 Living Dead: {living_dead['cases']} cases detected")
        
        # Calculate totals
        total_flags = (
            ghost_families['total_affected_employees'] +
            identity_theft['total_affected_employees'] +
            living_dead['cases']
        )
        
        print(f"✅ Audit Complete! Total flags: {total_flags}")
        
        return {
            "status": "success",
            "total_flags": total_flags,
            "ghost_families": ghost_families,
            "identity_theft": identity_theft,
            "living_dead": living_dead
        }
