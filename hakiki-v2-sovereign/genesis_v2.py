# FILE: genesis_v2.py
# HAKIKI AI v2 - Data Foundry
# Generates synthetic payroll data with 5 injected fraud types

import pandas as pd
import numpy as np
import random
import string

# --- CONFIGURATION ---
MINISTRIES = ["Ministry of Health", "Ministry of Education"]
SRC_SCALES = {
    "J": {"min": 33000, "max": 56000, "house_allowance": 10000},
    "K": {"min": 45000, "max": 78000, "house_allowance": 16500},
    "L": {"min": 60000, "max": 98000, "house_allowance": 25000},
    "M": {"min": 85000, "max": 138000, "house_allowance": 35000},
    "N": {"min": 125000, "max": 190000, "house_allowance": 45000},
    "P": {"min": 180000, "max": 280000, "house_allowance": 60000}
}
BANKS = ["Equity Bank", "KCB", "Co-op Bank", "NCBA", "Family Bank"]

def generate_kra_pin():
    """Generate valid KRA PIN format: Letter + 9 digits + Letter"""
    return f"{random.choice('AP')}{''.join(random.choices(string.digits, k=9))}{random.choice(string.ascii_uppercase)}"

def generate_ministry_data(n_employees, ministry_name):
    print(f"🔨 Forging Data for {ministry_name}...")
    ids = [f"{random.randint(20000000, 39999999)}" for _ in range(n_employees)]
    names = [f"Employee_{i}" for i in range(n_employees)]
    pins = [generate_kra_pin() for _ in range(n_employees)]
    job_groups = np.random.choice(list(SRC_SCALES.keys()), n_employees, p=[0.3, 0.3, 0.2, 0.1, 0.05, 0.05])
    
    accounts = []
    syndicate_acc = "111222333444"  # FRAUD: Ghost Family Pot
    for i in range(n_employees):
        if i < 15:
            accounts.append(syndicate_acc)
        else:
            accounts.append(f"{random.randint(1000000000, 9999999999)}")
            
    all_rows = []
    for i in range(n_employees):
        jg = job_groups[i]
        scale = SRC_SCALES[jg]
        basic = random.randint(scale["min"], scale["max"])
        house_allowance = scale["house_allowance"]
        commuter_allowance = 5000 if jg in ["J", "K"] else 12000
        special_allowance = 0
        
        # FRAUD 1: Grade Inflation (Employee 50-60 in J earns N salary)
        if 50 <= i <= 60:
            basic = SRC_SCALES["N"]["min"] + 5000
            
        # FRAUD 2: Allowance Shark (Employee 100)
        if i == 100:
            special_allowance = basic * 1.5
            
        # FRAUD 3: Bad KRA PIN (Employee 101)
        if i == 101:
            pins[i] = "INVALID_PIN"

        gross_pay = basic + house_allowance + commuter_allowance + special_allowance
        
        all_rows.append({
            "Ministry": ministry_name,
            "National_ID": ids[i],
            "Full_Name": names[i],
            "KRA_PIN": pins[i],
            "Job_Group": jg,
            "Basic_Salary": basic,
            "House_Allowance": house_allowance,
            "Commuter_Allowance": commuter_allowance,
            "Special_Allowance": special_allowance,
            "Gross_Pay": gross_pay,
            "Bank_Account_No": accounts[i]
        })
    return pd.DataFrame(all_rows)

if __name__ == "__main__":
    print("🚀 HAKIKI AI v2 - DATA FOUNDRY")
    print("=" * 50)
    
    # Set seed for reproducibility
    random.seed(42)
    np.random.seed(42)
    
    df_health = generate_ministry_data(1200, "Ministry of Health")
    df_education = generate_ministry_data(1500, "Ministry of Education")
    
    # FRAUD 4: Double Dippers (First 10 Health employees also in Education)
    double_dippers = df_health.iloc[:10].copy()
    double_dippers["Ministry"] = "Ministry of Education"
    
    df_final = pd.concat([df_health, df_education, double_dippers], ignore_index=True)
    
    output_file = "Hakiki_SRC_Data_v2.csv"
    df_final.to_csv(output_file, index=False)
    
    print("=" * 50)
    print(f"✅ DATA GENERATION COMPLETE")
    print(f"   📄 File: {output_file}")
    print(f"   📊 Records: {len(df_final)}")
    print(f"   💾 Size: {df_final.memory_usage(deep=True).sum() / 1024:.1f} KB")
    print("\n🔥 INJECTED FRAUD TYPES:")
    print("   1. Ghost Families: 30 employees sharing bank account 111222333444")
    print("   2. Grade Inflation: 11 employees (indices 50-60) earning N-level on J-group")
    print("   3. Allowance Sharks: 2 employees (index 100 per ministry)")
    print("   4. Invalid KRA PINs: 2 employees (index 101 per ministry)")
    print("   5. Double Dippers: 10 employees appearing in both ministries")
