"""
Force Initialize Database - Temporary script for HAKIKI AI v2.0
Run this to populate Neo4j with payroll data before starting the API.
"""
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.etl import PayrollETL
from app.core.config import settings


def main():
    print("=" * 60)
    print("🚀 HAKIKI AI v2.0 - Force Database Initialization")
    print("=" * 60)
    
    try:
        # Initialize ETL
        etl = PayrollETL()
        
        # Load data
        print(f"\n📂 Loading from: {settings.DATASET_PATH}")
        result = etl.load_csv_to_graph(settings.DATASET_PATH)
        
        print("\n" + "=" * 60)
        print("✅ DATABASE POPULATED SUCCESSFULLY!")
        print("=" * 60)
        print(f"   Records loaded: {result['records_loaded']:,}")
        print(f"   Employees:      {result['employees']:,}")
        print(f"   Bank Accounts:  {result['bank_accounts']:,}")
        print(f"   Departments:    {result['departments']:,}")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print("\nMake sure Neo4j is running:")
        print("  cd docker && docker-compose up -d")
        sys.exit(1)


if __name__ == "__main__":
    main()
