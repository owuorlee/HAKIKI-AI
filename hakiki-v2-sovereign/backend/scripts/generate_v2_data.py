"""
Sovereign-Grade Synthetic Data Generator for HAKIKI AI v2.0
Generates 50,000 employees with tiered risk distribution (85% Honest, 10% Sloppy, 4% Greedy, 1% Reckless)
Includes Identity Theft, Ghost Families, and Living Dead injections
"""
import pandas as pd
import numpy as np
import random
import os
from datetime import datetime

# Try faker, fall back to simple name generation
try:
    from faker import Faker
    fake = Faker()
    def get_name():
        return fake.name()
    def get_iban():
        return fake.iban()
except ImportError:
    print("[WARNING] faker not installed, using basic name generation")
    FIRST_NAMES = ["John", "Jane", "Peter", "Mary", "David", "Sarah", "Michael", "Emily", "James", "Anna", 
                   "Robert", "Linda", "William", "Elizabeth", "Richard", "Susan", "Joseph", "Karen", "Thomas", "Nancy",
                   "George", "Patricia", "Kenneth", "Gloria", "Steven", "Sharon", "Edward", "Dorothy", "Brian", "Ruth"]
    LAST_NAMES = ["Mwangi", "Ochieng", "Kamau", "Wanjiku", "Njoroge", "Otieno", "Wangari", "Kimani", "Nyambura", "Ouma",
                  "Karanja", "Akinyi", "Mutua", "Chebet", "Kipchoge", "Wekesa", "Ndungu", "Adhiambo", "Gitau", "Korir",
                  "Macharia", "Auma", "Kiptoo", "Wairimu", "Kemboi", "Rotich", "Njoki", "Kosgei", "Wambui", "Cheruiyot"]
    def get_name():
        return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
    def get_iban():
        return f"KE{random.randint(10000000000000, 99999999999999)}"


def generate_perfect_payroll():
    """Generate sovereign-grade synthetic payroll data with guaranteed variance."""
    print("[INFO] Generating Sovereign-Grade Synthetic Data...")
    print(f"[INFO] Timestamp: {datetime.now().isoformat()}")
    
    # Configuration
    NUM_EMPLOYEES = 50000
    
    # Kenyan Civil Service Job Groups (SRC Scales 2024)
    JOB_GROUPS = {
        'A': 25000, 'B': 35000, 'C': 45000, 'D': 55000, 
        'E': 70000, 'F': 90000, 'G': 120000, 'H': 150000,
        'J': 180000, 'K': 250000, 'L': 320000, 'M': 400000
    }
    
    DEPARTMENTS = ["Health", "Transport", "Education", "Treasury", "Interior", 
                   "Agriculture", "Defence", "Energy", "ICT", "Tourism"]
    
    data = []
    
    # Special Fraud Buckets
    # 10 Compromised Bank Accounts (Ghost Families)
    bank_fraud_clusters = [get_iban() for _ in range(10)]
    
    # 15 Compromised National IDs (Identity Theft)
    stolen_ids = [str(random.randint(10000000, 99999999)) for _ in range(15)]
    
    # Track stats
    tier_counts = {0: 0, 1: 0, 2: 0, 3: 0}
    id_theft_count = 0
    ghost_family_count = 0
    living_dead_count = 0
    
    random.seed(42)  # Reproducible
    np.random.seed(42)
    
    for i in range(NUM_EMPLOYEES):
        # 1. Assign Job Group & Base Salary (weighted distribution)
        group = random.choices(
            list(JOB_GROUPS.keys()), 
            weights=[15, 15, 15, 10, 10, 10, 5, 5, 5, 5, 3, 2]  # More junior staff
        )[0]
        base_salary = JOB_GROUPS[group]
        
        # 2. Determine Risk Tier (The Gradient)
        # Tier 0: Honest (85%) - 1.0x salary
        # Tier 1: Sloppy (10%) - 1.1x-1.3x salary (Error-prone, creates 60-70% scores)
        # Tier 2: Greedy (4%) - 1.5x-2.5x salary (Creates 70-90% scores)
        # Tier 3: Reckless (1%) - 3.0x-6.0x salary (Creates 99% scores)
        tier = random.choices([0, 1, 2, 3], weights=[85, 10, 4, 1])[0]
        tier_counts[tier] += 1
        
        multiplier = 1.0
        if tier == 1:
            multiplier = random.uniform(1.1, 1.3)  # The "Bridge"
        elif tier == 2:
            multiplier = random.uniform(1.5, 2.5)  # The "Middle"
        elif tier == 3:
            multiplier = random.uniform(3.0, 6.0)  # The "Top"
        
        # 3. Apply Jitter (The Clump Killer) - ±KES 4000
        jitter = random.uniform(-4000, 4000)
        gross_salary = round((base_salary * multiplier) + jitter, 2)
        basic_salary = round(gross_salary * random.uniform(0.6, 0.75), 2)  # Basic is 60-75% of gross
        
        # 4. Identity Logic
        national_id = str(random.randint(10000000, 99999999))
        name = get_name()
        
        # Inject Identity Theft: First 30 rows reuse stolen IDs with different names
        if i < 30:
            national_id = stolen_ids[i % 15]
            id_theft_count += 1
        
        # 5. Bank Logic
        bank_acc = get_iban()
        
        # Inject Ghost Families: Tier 2/3 people share bank accounts (30% chance)
        if tier >= 2 and random.random() < 0.3:
            bank_acc = random.choice(bank_fraud_clusters)
            ghost_family_count += 1
            
        # 6. Age Logic (Living Dead)
        age = random.randint(22, 60)
        
        # 0.5% are "Living Dead" (Age > 70)
        if random.random() < 0.005:
            age = random.randint(75, 99)
            living_dead_count += 1
        
        # 7. Device ID (for Sentinel Mobile)
        device_id = f"DEV-{random.randint(1000, 9999)}"
        
        data.append({
            "Employee_ID": f"EMP-{100000 + i}",
            "Full_Name": name,
            "National_ID": national_id,
            "Job_Group": group,
            "Department": random.choice(DEPARTMENTS),
            "Basic_Salary": basic_salary,
            "Gross_Salary": gross_salary,
            "Bank_Account": bank_acc,
            "Age": age,
            "Device_ID": device_id,
            "Status": "Active"
        })
    
    # Save
    df = pd.DataFrame(data)
    
    # Determine output path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, "..", "app", "utils", "hakiki_v2_perfect.csv")
    output_path = os.path.normpath(output_path)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    df.to_csv(output_path, index=False)
    
    # Print Stats
    print(f"\n{'='*50}")
    print(f"[SUCCESS] Generated {len(df)} employees")
    print(f"{'='*50}")
    print(f"TIER DISTRIBUTION:")
    print(f"  Tier 0 (Honest):   {tier_counts[0]:,} ({tier_counts[0]/NUM_EMPLOYEES*100:.1f}%)")
    print(f"  Tier 1 (Sloppy):   {tier_counts[1]:,} ({tier_counts[1]/NUM_EMPLOYEES*100:.1f}%)")
    print(f"  Tier 2 (Greedy):   {tier_counts[2]:,} ({tier_counts[2]/NUM_EMPLOYEES*100:.1f}%)")
    print(f"  Tier 3 (Reckless): {tier_counts[3]:,} ({tier_counts[3]/NUM_EMPLOYEES*100:.1f}%)")
    print(f"\nFRAUD INJECTIONS:")
    print(f"  Identity Theft:  {id_theft_count} (15 IDs × 2 people)")
    print(f"  Ghost Families:  {ghost_family_count} people sharing 10 accounts")
    print(f"  Living Dead:     {living_dead_count} (Age > 70)")
    print(f"\nSALARY RANGE:")
    print(f"  Min: KES {df['Gross_Salary'].min():,.2f}")
    print(f"  Max: KES {df['Gross_Salary'].max():,.2f}")
    print(f"  Mean: KES {df['Gross_Salary'].mean():,.2f}")
    print(f"\nFile saved to: {output_path}")
    
    return df


if __name__ == "__main__":
    generate_perfect_payroll()
