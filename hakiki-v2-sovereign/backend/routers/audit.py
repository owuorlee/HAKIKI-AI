from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io
import json

router = APIRouter()

@router.post("/scan")
async def scan_payroll(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload CSV or Excel.")

    try:
        print(f"📥 [UPLOAD] Receiving file: {file.filename}")
        
        # 1. READ THE FILE
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))

        # 2. NORMALIZE COLUMNS (Handle different CSV formats)
        # We create a map to rename common variations to our standard names
        column_map = {
            # Standard -> Target
            'National ID': 'NationalID',
            'National_ID': 'NationalID',
            'id_number': 'NationalID',
            'EmployeeID': 'NationalID',
            
            'Full Name': 'Name',
            'Full_Name': 'Name',
            'EmployeeName': 'Name',
            
            'Basic Salary': 'BasicSalary',
            'Basic_Salary': 'BasicSalary',
            
            'HouseAllowance': 'Allowances',
            'House_Allowance': 'Allowances',
            'Transport_Allowance': 'Allowances' # Simple aggregation for MVP
        }
        
        # Rename columns if they exist
        df.rename(columns=column_map, inplace=True)
        print(f"🔄 [NORMALIZER] Columns present: {df.columns.tolist()}")

        # Check if critical columns exist after renaming
        if 'NationalID' not in df.columns:
            raise ValueError(f"Could not find 'NationalID' column. Found: {df.columns.tolist()}")

        # 3. PERFORM FORENSIC ANALYSIS
        # Rule 1: Find Duplicates
        duplicates = df[df.duplicated(subset=['NationalID'], keep=False)]
        
        # Rule 2: Find Allowance Fraud (Allowances > 50% of Basic)
        allowance_fraud = pd.DataFrame()
        if 'BasicSalary' in df.columns and 'Allowances' in df.columns:
            # Ensure numeric
            df['BasicSalary'] = pd.to_numeric(df['BasicSalary'], errors='coerce').fillna(0)
            df['Allowances'] = pd.to_numeric(df['Allowances'], errors='coerce').fillna(0)
            allowance_fraud = df[df['Allowances'] > (df['BasicSalary'] * 0.5)]

        # 4. CALCULATE RISK (CamelCase for Frontend)
        total_risk = 0.0
        
        # Sum duplicates salary
        if not duplicates.empty:
            # Try to find a salary column
            salary_col = 'NetSalary' if 'NetSalary' in df.columns else 'BasicSalary'
            if salary_col in df.columns:
                 total_risk += df.loc[duplicates.index, salary_col].sum()
        
        # Sum fraud allowances
        if not allowance_fraud.empty:
            total_risk += allowance_fraud['Allowances'].sum()

        top_suspects = []
        if not duplicates.empty and 'Name' in df.columns:
            top_suspects = duplicates['Name'].head(3).tolist()

        # 5. GENERATE REPORT (Frontend Compatible Keys)
        # We use camelCase keys (e.g., 'totalRisk') to match the React Frontend
        report = {
            "totalRecords": len(df),
            "ghostCount": len(duplicates),
            "allowanceFraud": len(allowance_fraud),
            "totalRisk": float(total_risk),          # <--- THE FIX (Was total_financial_risk)
            "status": "CRITICAL RISK" if total_risk > 0 else "SECURE",
            "suspects": top_suspects
        }

        # 6. SAVE TO MEMORY
        memory_data = {
            "total_risk": float(total_risk),
            "ghost_count": len(duplicates),
            "allowance_count": len(allowance_fraud),
            "top_suspects": top_suspects
        }
        
        try:
            with open("audit_memory.json", "w") as f:
                json.dump(memory_data, f)
            print("✅ [MEMORY SAVED] Findings stored.")
        except Exception:
            pass

        return report

    except Exception as e:
        print(f"❌ ERROR SCANNING FILE: {e}")
        raise HTTPException(status_code=500, detail=str(e))
