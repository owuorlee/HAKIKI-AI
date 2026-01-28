"""
ETL Pipeline for HAKIKI AI v2.0
Loads payroll data from CSV into Neo4j graph database.
"""
import pandas as pd
from typing import Optional
from app.core.database import get_neo4j_client


class PayrollETL:
    """
    ETL Pipeline for loading payroll CSV data into Neo4j.
    Creates Employee, BankAccount, and Department nodes with relationships.
    """
    
    BATCH_SIZE = 1000
    
    # Cypher query for batch node/relationship creation
    LOAD_BATCH_QUERY = """
    UNWIND $batch AS row
    
    // Create or merge Employee node
    MERGE (e:Employee {national_id: row.national_id})
    SET e.employee_id = row.employee_id,
        e.name = row.full_name,
        e.kra_pin = row.kra_pin,
        e.job_group = row.job_group,
        e.basic_salary = row.basic_salary,
        e.gross_salary = row.gross_salary,
        e.phone = row.phone_number,
        e.dob = row.date_of_birth,
        e.status = row.employment_status,
        e.risk_label = row.risk_label,
        e.fraud_type = row.fraud_type
    
    // Create or merge BankAccount node
    MERGE (b:BankAccount {account_number: row.bank_account})
    SET b.bank_name = row.bank_name
    
    // Create or merge Department node
    MERGE (d:Department {name: row.department})
    
    // Create relationships
    MERGE (e)-[:DEPOSITS_TO]->(b)
    MERGE (e)-[:WORKS_AT]->(d)
    """
    
    def __init__(self):
        self.client = get_neo4j_client()
        self.records_processed = 0
    
    def _prepare_batch(self, df_chunk: pd.DataFrame) -> list:
        """Convert DataFrame chunk to list of dicts for Cypher query."""
        records = []
        for _, row in df_chunk.iterrows():
            records.append({
                "employee_id": str(row.get("Employee_ID", "")),
                "national_id": str(row.get("National_ID", "")),
                "full_name": str(row.get("Full_Name", "")),
                "kra_pin": str(row.get("KRA_PIN", "")),
                "job_group": str(row.get("Job_Group", "")),
                "basic_salary": float(row.get("Basic_Salary", 0)),
                "gross_salary": float(row.get("Gross_Salary", 0)),
                "bank_account": str(row.get("Bank_Account", "")),
                "bank_name": str(row.get("Bank_Name", "")),
                "department": str(row.get("Department", "")),
                "phone_number": str(row.get("Phone_Number", "")),
                "date_of_birth": str(row.get("Date_of_Birth", "")),
                "employment_status": str(row.get("Employment_Status", "")),
                "risk_label": int(row.get("Risk_Label", 0)),
                "fraud_type": str(row.get("Fraud_Type", "None"))
            })
        return records
    
    def _create_indexes(self) -> None:
        """Create indexes for optimal query performance."""
        indexes = [
            "CREATE INDEX IF NOT EXISTS FOR (e:Employee) ON (e.national_id)",
            "CREATE INDEX IF NOT EXISTS FOR (e:Employee) ON (e.kra_pin)",
            "CREATE INDEX IF NOT EXISTS FOR (b:BankAccount) ON (b.account_number)",
            "CREATE INDEX IF NOT EXISTS FOR (d:Department) ON (d.name)"
        ]
        
        with self.client.get_session() as session:
            for idx_query in indexes:
                session.run(idx_query)
        print("📇 Database indexes created")
    
    def _clear_existing_data(self) -> None:
        """Clear existing nodes and relationships (for fresh load)."""
        with self.client.get_session() as session:
            session.run("MATCH (n) DETACH DELETE n")
        print("🗑️  Cleared existing graph data")
    
    def load_csv_to_graph(self, file_path: str, clear_existing: bool = True) -> dict:
        """
        Load payroll CSV into Neo4j graph database.
        
        Args:
            file_path: Path to the CSV file
            clear_existing: Whether to clear existing data before loading
            
        Returns:
            Summary dict with load statistics
        """
        print(f"📂 Loading payroll data from: {file_path}")
        
        # Read CSV
        try:
            df = pd.read_csv(file_path)
            total_records = len(df)
            print(f"📊 Found {total_records:,} records in CSV")
        except Exception as e:
            print(f"❌ Failed to read CSV: {e}")
            raise
        
        # Prepare database
        if clear_existing:
            self._clear_existing_data()
        self._create_indexes()
        
        # Process in batches
        batch_count = 0
        for start in range(0, total_records, self.BATCH_SIZE):
            end = min(start + self.BATCH_SIZE, total_records)
            chunk = df.iloc[start:end]
            batch = self._prepare_batch(chunk)
            
            with self.client.get_session() as session:
                session.run(self.LOAD_BATCH_QUERY, {"batch": batch})
            
            batch_count += 1
            self.records_processed = end
            progress = (end / total_records) * 100
            print(f"   ⏳ Batch {batch_count}: {end:,}/{total_records:,} ({progress:.1f}%)")
        
        # Get final counts
        stats = self._get_graph_stats()
        print(f"✅ ETL Complete! Loaded {total_records:,} records")
        print(f"   📍 Employees: {stats['employees']:,}")
        print(f"   🏦 Bank Accounts: {stats['bank_accounts']:,}")
        print(f"   🏢 Departments: {stats['departments']:,}")
        
        return {
            "status": "success",
            "records_loaded": total_records,
            **stats
        }
    
    def _get_graph_stats(self) -> dict:
        """Get node counts from the graph."""
        with self.client.get_session() as session:
            result = session.run("""
                MATCH (e:Employee) WITH COUNT(e) AS employees
                MATCH (b:BankAccount) WITH employees, COUNT(b) AS banks
                MATCH (d:Department) WITH employees, banks, COUNT(d) AS depts
                RETURN employees, banks, depts
            """)
            record = result.single()
            return {
                "employees": record["employees"],
                "bank_accounts": record["banks"],
                "departments": record["depts"]
            }
