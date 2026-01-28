# FILE: investigator.py
# HAKIKI AI v2 - Sovereign Investigator
# Deterministic fraud detection based on Kenyan payroll laws (SRC Circulars)

import pandas as pd
import re

# --- SRC RULES (The Law) ---
SRC_CEILINGS = {
    "J": 56000, 
    "K": 78000, 
    "L": 98000, 
    "M": 138000, 
    "N": 190000, 
    "P": 280000
}

class SovereignInvestigator:
    """
    Deterministic fraud detection engine.
    Implements 5 legally defensible checks:
    1. KRA PIN format validation
    2. Ghost Families (shared bank accounts)
    3. Double Dippers (cross-ministry employment)
    4. Grade Inflation (salary > SRC ceiling)
    5. Allowance Sharks (special allowance > basic)
    """
    
    def __init__(self, filepath):
        self.df = pd.read_csv(filepath)
        self.results = {}
        print(f"📂 Loaded {len(self.df)} records from {filepath}")
        print(f"   Ministries: {self.df['Ministry'].unique().tolist()}")

    def validate_kra_format(self):
        """Check 1: Validate KRA PIN format (Letter + 9 Digits + Letter)"""
        print("\n🔍 CHECK 1: KRA PIN FORMAT...")
        pattern = r"^[A-Z]\d{9}[A-Z]$"
        mask = self.df["KRA_PIN"].astype(str).str.match(pattern)
        invalids = self.df[~mask]
        count = len(invalids)
        self.results["kra_invalid"] = count
        print(f"   🚩 Found {count} Invalid PINs")
        if count > 0:
            print(f"   📋 Sample: {invalids['KRA_PIN'].head(3).tolist()}")
        return count

    def hunt_ghost_families(self):
        """Check 2: Find bank accounts shared by multiple employees"""
        print("\n🔍 CHECK 2: GHOST FAMILIES (Shared Banks)...")
        counts = self.df.groupby("Bank_Account_No")["National_ID"].nunique()
        syndicates = counts[counts > 1]
        count = len(syndicates)
        self.results["ghost_families"] = count
        print(f"   🚩 Found {count} Bank Accounts used by multiple people")
        if count > 0:
            worst = syndicates.idxmax()
            print(f"   📋 Worst offender: Account {worst} has {syndicates.max()} depositors")
        return count

    def hunt_double_dippers(self):
        """Check 3: Find employees appearing in multiple ministries"""
        print("\n🔍 CHECK 3: DOUBLE DIPPERS (Cross-Ministry)...")
        counts = self.df.groupby("National_ID")["Ministry"].nunique()
        cheats = counts[counts > 1]
        count = len(cheats)
        self.results["double_dippers"] = count
        print(f"   🚩 Found {count} Employees in >1 Ministry")
        if count > 0:
            sample_id = cheats.index[0]
            ministries = self.df[self.df["National_ID"] == sample_id]["Ministry"].unique()
            print(f"   📋 Sample: ID {sample_id} appears in {ministries.tolist()}")
        return count

    def hunt_grade_inflation(self):
        """Check 4: Find salaries exceeding SRC ceiling for job group"""
        print("\n🔍 CHECK 4: GRADE INFLATION (SRC Violations)...")
        violations = []
        for jg, limit in SRC_CEILINGS.items():
            mask = (self.df["Job_Group"] == jg) & (self.df["Basic_Salary"] > limit)
            jg_violators = self.df[mask]
            if len(jg_violators) > 0:
                violations.append({
                    "job_group": jg,
                    "limit": limit,
                    "count": len(jg_violators),
                    "max_salary": jg_violators["Basic_Salary"].max()
                })
        
        total = sum(v["count"] for v in violations)
        self.results["grade_inflation"] = total
        print(f"   🚩 Found {total} Salaries exceeding Job Group limits")
        for v in violations:
            print(f"   📋 Group {v['job_group']}: {v['count']} violations (max KES {v['max_salary']:,} vs limit {v['limit']:,})")
        return total

    def hunt_allowance_sharks(self):
        """Check 5: Find suspicious allowances exceeding basic salary"""
        print("\n🔍 CHECK 5: ALLOWANCE SHARKS...")
        mask = self.df["Special_Allowance"] > self.df["Basic_Salary"]
        sharks = self.df[mask]
        count = len(sharks)
        self.results["allowance_sharks"] = count
        print(f"   🚩 Found {count} High-Risk Allowance Cases")
        if count > 0:
            worst = sharks.loc[sharks["Special_Allowance"].idxmax()]
            print(f"   📋 Worst case: {worst['Full_Name']} - Allowance KES {worst['Special_Allowance']:,.0f} vs Basic KES {worst['Basic_Salary']:,.0f}")
        return count

    def run_full_audit(self):
        """Execute all 5 fraud detection checks"""
        print("\n" + "=" * 60)
        print("🛡️  HAKIKI AI v2 - SOVEREIGN INVESTIGATOR")
        print("=" * 60)
        
        kra = self.validate_kra_format()
        ghost = self.hunt_ghost_families()
        double = self.hunt_double_dippers()
        grade = self.hunt_grade_inflation()
        allowance = self.hunt_allowance_sharks()
        
        print("\n" + "=" * 60)
        print("✅ AUDIT COMPLETE - SUMMARY")
        print("=" * 60)
        print(f"   🔴 Invalid KRA PINs:    {kra}")
        print(f"   🔴 Ghost Families:      {ghost}")
        print(f"   🔴 Double Dippers:      {double}")
        print(f"   🔴 Grade Inflation:     {grade}")
        print(f"   🔴 Allowance Sharks:    {allowance}")
        print(f"   ──────────────────────────────")
        print(f"   📊 TOTAL FLAGS:         {kra + ghost + double + grade + allowance}")
        
        return self.results

if __name__ == "__main__":
    engine = SovereignInvestigator("Hakiki_SRC_Data_v2.csv")
    results = engine.run_full_audit()
    
    # Validation assertions
    print("\n" + "=" * 60)
    print("🧪 VALIDATION HARNESS")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    # Check 1: KRA (expect ≥1)
    if results["kra_invalid"] >= 1:
        print("   ✅ KRA Check: PASS (≥1 invalid)")
        passed += 1
    else:
        print(f"   ❌ KRA Check: FAIL (expected ≥1, got {results['kra_invalid']})")
        failed += 1
    
    # Check 2: Ghost Families (expect ≥1)
    if results["ghost_families"] >= 1:
        print("   ✅ Ghost Families: PASS (≥1 syndicate)")
        passed += 1
    else:
        print(f"   ❌ Ghost Families: FAIL (expected ≥1, got {results['ghost_families']})")
        failed += 1
    
    # Check 3: Double Dippers (expect exactly 10)
    if results["double_dippers"] == 10:
        print("   ✅ Double Dippers: PASS (exactly 10)")
        passed += 1
    else:
        print(f"   ❌ Double Dippers: FAIL (expected 10, got {results['double_dippers']})")
        failed += 1
    
    # Check 4: Grade Inflation (expect ≥11)
    if results["grade_inflation"] >= 11:
        print("   ✅ Grade Inflation: PASS (≥11 cases)")
        passed += 1
    else:
        print(f"   ❌ Grade Inflation: FAIL (expected ≥11, got {results['grade_inflation']})")
        failed += 1
    
    # Check 5: Allowance Sharks (expect ≥1)
    if results["allowance_sharks"] >= 1:
        print("   ✅ Allowance Sharks: PASS (≥1 case)")
        passed += 1
    else:
        print(f"   ❌ Allowance Sharks: FAIL (expected ≥1, got {results['allowance_sharks']})")
        failed += 1
    
    print(f"\n   📊 VALIDATION RESULT: {passed}/5 PASSED")
    
    if failed == 0:
        print("   🎉 ALL CHECKS PASSED - PHASE 1 COMPLETE!")
    else:
        print(f"   ⚠️  {failed} CHECK(S) FAILED - Review genesis_v2.py")
