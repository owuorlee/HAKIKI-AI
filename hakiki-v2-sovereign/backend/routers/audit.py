from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io

router = APIRouter()

@router.post("/scan")
async def scan_payroll(file: UploadFile = File(...)):
    print(f"✅ ANALYZING FILE: {file.filename}")
    
    try:
        # 1. READ FILE
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        # df.columns = [c.strip() for c in df.columns] # Clean headers - User requested code had this, ensuring it matches provided prompt exactly or slightly better if needed. The prompt had it.
        # But wait, the prompt code says: df.columns = [c.strip() for c in df.columns] # Clean headers
        
        # Adjusting column names to be flexible or strict? 
        # The prompt code expects 'BasicSalary', 'HouseAllowance', 'HardshipAllowance'.
        # I should probably map them or just ensure the clean headers line is there.
        df.columns = [c.strip() for c in df.columns] 

        suspects = []
        total_risk = 0
        ghost_count = 0
        allowance_count = 0
        dipper_count = 0

        # DATA CLEANING / TYPE CASTING (Safety)
        cols_to_numeric = ['BasicSalary', 'HouseAllowance', 'HardshipAllowance']
        for col in cols_to_numeric:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
            else:
                # If column missing, fill with 0 to prevent key error in logic
                df[col] = 0

        # 2. ANALYSIS LOOP
        # (Find Duplicates)
        # Check if EmployeeID exists
        if 'EmployeeID' in df.columns:
            dup_ids = df[df.duplicated('EmployeeID', keep=False)]['EmployeeID'].unique()
        else:
            dup_ids = []

        for index, row in df.iterrows():
            anomalies = []
            risk_score = 0
            
            # CHECK 1: Ghost (Duplicate ID)
            if 'EmployeeID' in row and row['EmployeeID'] in dup_ids:
                anomalies.append("Duplicate ID Detect (Ghost Pattern)")
                risk_score += 50
                ghost_count += 1
            
            # CHECK 2: Allowance Fraud (Over 50% of Basic)
            allowances = row.get('HouseAllowance', 0) + row.get('HardshipAllowance', 0)
            basic_salary = row.get('BasicSalary', 0)
            
            if basic_salary > 0 and allowances > (basic_salary * 0.5):
                anomalies.append("Suspicious Allowance Ratio")
                risk_score += 30
                allowance_count += 1

            # FINALIZE SUSPECT
            if risk_score > 0:
                total_risk += basic_salary
                suspects.append({
                    "id": str(row.get('EmployeeID', 'UNK')),
                    "name": str(row.get('Name', 'Unknown')),
                    "department": str(row.get('Department', 'Unspecified')),
                    "riskScore": min(risk_score, 99), # Cap at 99
                    "anomalies": anomalies
                })

        # 3. RETURN JSON
                "doubleDipperCount": dipper_count
            },
            "suspects": sorted(suspects, key=lambda x: x['riskScore'], reverse=True)
        }

        # --- MEMORY INJECTION START ---
        import json
        memory_data = {
            "total_risk": int(total_risk),
            "ghost_count": ghost_count,
            "allowance_count": allowance_count,
            "top_suspects": [s['name'] for s in sorted(suspects, key=lambda x: x['riskScore'], reverse=True)[:3]] 
        }
        with open("audit_memory.json", "w") as f:
            json.dump(memory_data, f)
        print("✅ MEMORY UPDATED: audit_memory.json")
        # --- MEMORY INJECTION END ---

        return {
            "message": "Forensic Scan Complete",
            "summary": {
                "totalRisk": int(total_risk),
                "ghostCount": ghost_count,
                "allowanceCount": allowance_count,
                "doubleDipperCount": dipper_count
            },
            "suspects": sorted(suspects, key=lambda x: x['riskScore'], reverse=True)
        }

    except Exception as e:
        print(f"❌ LOGIC ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
