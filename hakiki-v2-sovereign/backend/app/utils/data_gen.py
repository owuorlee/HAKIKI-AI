import pandas as pd
import numpy as np
from faker import Faker
import random
import uuid
from datetime import datetime, timedelta

# Initialize Faker with Kenya Locale
fake = Faker('en_KE')
Faker.seed(42)
random.seed(42)
np.random.seed(42)

class HakikiDataGenerator:
    def __init__(self, num_records=50000):
        self.num_records = num_records
        self.data = []
        
        # --- 1. REALISTIC KENYAN SALARY SCALES (SRC APPROXIMATION) ---
        # Structure: JobGroup: (Min_Sal, Max_Sal, House_Allow_Nairobi, House_Allow_Rural)
        self.SRC_SCALES = {
            'A': (15000, 18000, 3500, 2500), 'B': (19000, 23000, 4000, 3000),
            'C': (24000, 29000, 5000, 3500), 'D': (30000, 35000, 6000, 4000),
            'E': (36000, 42000, 7500, 5000), 'F': (43000, 50000, 9000, 6000),
            'G': (51000, 60000, 12000, 7000), 'H': (61000, 75000, 15000, 9000), # Teachers/Clerks
            'J': (76000, 90000, 20000, 12000), 'K': (91000, 110000, 25000, 15000),
            'L': (111000, 130000, 30000, 20000), 'M': (131000, 160000, 35000, 22000),
            'N': (161000, 200000, 45000, 25000), 'P': (201000, 280000, 60000, 35000), # Directors
            'Q': (281000, 350000, 80000, 40000), 'R': (351000, 450000, 100000, 50000)
        }
        
        self.BANKS = ['KCB', 'Equity', 'Co-operative', 'Absa', 'NCBA', 'Diamond Trust', 'Standard Chartered']
        self.COUNTIES = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Uasin Gishu', 'Kiambu', 'Machakos', 'Nyeri', 'Garissa', 'Turkana']
        
        # Departments mapping
        self.DEPTS = [
            'Education', 'Health', 'Infrastructure', 'Finance', 'ICT', 
            'Water & Sanitation', 'Lands', 'Agriculture', 'Interior'
        ]

    def _generate_kra_pin(self):
        """Generates valid format A000000000Z"""
        return f"A{random.randint(100000000, 999999999)}{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}"

    def _generate_clean_record(self):
        """Generates a mathematically valid employee record."""
        jg = np.random.choice(list(self.SRC_SCALES.keys()), p=[0.05, 0.05, 0.1, 0.1, 0.1, 0.1, 0.1, 0.15, 0.1, 0.05, 0.03, 0.03, 0.02, 0.01, 0.005, 0.005])
        min_s, max_s, h_nairobi, h_rural = self.SRC_SCALES[jg]
        
        county = np.random.choice(self.COUNTIES)
        is_nairobi = county == 'Nairobi'
        
        # Calculate Salary Components
        basic = random.randint(min_s, max_s)
        house = h_nairobi if is_nairobi else h_rural
        commuter = random.choice([4000, 6000, 8000, 12000, 16000]) # Fixed tiers
        gross = basic + house + commuter
        
        return {
            "Employee_ID": f"EMP-{uuid.uuid4().hex[:8].upper()}",
            "National_ID": str(random.randint(10000000, 39999999)),
            "Full_Name": fake.name(),
            "KRA_PIN": self._generate_kra_pin(),
            "Job_Group": jg,
            "Designation": fake.job(),
            "Department": np.random.choice(self.DEPTS),
            "Duty_Station": f"{county} - {fake.city()}",
            "County": county,
            "Basic_Salary": basic,
            "House_Allowance": house,
            "Commuter_Allowance": commuter,
            "Gross_Salary": gross,
            "Bank_Name": np.random.choice(self.BANKS),
            "Bank_Account": str(random.randint(1000000000, 9999999999)),
            "Phone_Number": f"+2547{random.randint(10000000, 99999999)}",
            "Employment_Status": "Active",
            "Date_of_Birth": fake.date_of_birth(minimum_age=22, maximum_age=60).strftime('%Y-%m-%d'),
            "Device_ID": str(uuid.uuid4()),
            "Liveness_Score": round(random.uniform(0.85, 0.99), 2),
            "Risk_Label": 0, # 0 = Normal, 1 = Fraud
            "Fraud_Type": "None"
        }

    def generate_dataset(self):
        print(f"🏗️ Generating {self.num_records} clean records...")
        for _ in range(self.num_records):
            self.data.append(self._generate_clean_record())
        
        df = pd.DataFrame(self.data)
        
        # --- INJECT FRAUD SCENARIOS ---
        print("💉 Injecting Fraud Patterns...")
        df = self._inject_ghost_families(df)
        df = self._inject_salary_padding(df)
        df = self._inject_duplicate_identities(df)
        df = self._inject_living_dead(df)
        df = self._inject_device_spoofing(df)
        
        return df

    # --- FRAUD LOGIC ---

    def _inject_ghost_families(self, df):
        """
        Scenario: 1 Bank Account shared by 5-10 people.
        Target: Neo4j Graph Detection.
        """
        num_rings = 50
        print(f"   -> Creating {num_rings} Ghost Families (Shared Bank Accounts)")
        
        for _ in range(num_rings):
            # Pick a 'Mule' account
            mule_idx = random.randint(0, len(df)-1)
            mule_bank = df.at[mule_idx, 'Bank_Name']
            mule_acc = df.at[mule_idx, 'Bank_Account']
            
            # Recruit 5-12 ghosts
            ghost_indices = random.sample(range(len(df)), random.randint(5, 12))
            for idx in ghost_indices:
                df.at[idx, 'Bank_Name'] = mule_bank
                df.at[idx, 'Bank_Account'] = mule_acc
                df.at[idx, 'Risk_Label'] = 1
                df.at[idx, 'Fraud_Type'] = "Ghost Family (Shared Bank)"
        return df

    def _inject_salary_padding(self, df):
        """
        Scenario: Low Job Group earning Director-level salary.
        Target: Isolation Forest (Statistical Outlier).
        """
        count = int(self.num_records * 0.02) # 2% of data
        print(f"   -> Creating {count} Salary Padding cases")
        
        indices = np.random.choice(df[df['Job_Group'].isin(['A', 'B', 'C'])].index, count)
        for idx in indices:
            # Boost salary to 150k+ (Normal is ~20k)
            new_basic = random.randint(150000, 300000)
            df.at[idx, 'Basic_Salary'] = new_basic
            df.at[idx, 'Gross_Salary'] = new_basic + df.at[idx, 'House_Allowance']
            df.at[idx, 'Risk_Label'] = 1
            df.at[idx, 'Fraud_Type'] = "Salary Padding"
        return df

    def _inject_duplicate_identities(self, df):
        """
        Scenario: Multiple Employee IDs sharing the same KRA PIN.
        Target: Neo4j / SQL GroupBy.
        """
        count = 100
        print(f"   -> Creating {count} Identity Theft cases")
        
        for _ in range(count):
            victim_idx = random.randint(0, len(df)-1)
            victim_pin = df.at[victim_idx, 'KRA_PIN']
            
            # Create a ghost using this PIN
            ghost_idx = random.randint(0, len(df)-1)
            if ghost_idx != victim_idx:
                df.at[ghost_idx, 'KRA_PIN'] = victim_pin
                df.at[ghost_idx, 'Risk_Label'] = 1
                df.at[ghost_idx, 'Fraud_Type'] = "Duplicate KRA PIN"
        return df

    def _inject_living_dead(self, df):
        """
        Scenario: Active employees aged > 65 or with 'Deceased' in name.
        Target: Rule-based Filter.
        """
        count = 200
        print(f"   -> Creating {count} 'Living Dead' cases")
        
        indices = random.sample(range(len(df)), count)
        for idx in indices:
            # Pattern 1: Age manipulation
            fake_dob = fake.date_of_birth(minimum_age=70, maximum_age=90).strftime('%Y-%m-%d')
            df.at[idx, 'Date_of_Birth'] = fake_dob
            
            # Pattern 2: Name leak
            if random.random() > 0.5:
                current_name = df.at[idx, 'Full_Name']
                df.at[idx, 'Full_Name'] = f"{current_name} (DECEASED)"
                
            df.at[idx, 'Risk_Label'] = 1
            df.at[idx, 'Fraud_Type'] = "Living Dead"
        return df
    
    def _inject_device_spoofing(self, df):
        """
        Scenario: High liveness score, but Device ID shared by 20 people (Buddy Punching).
        Target: Graph / Attendance Module.
        """
        print(f"   -> Creating Device Spoofing ring")
        shared_device = str(uuid.uuid4())
        
        indices = random.sample(range(len(df)), 25)
        for idx in indices:
            df.at[idx, 'Device_ID'] = shared_device
            df.at[idx, 'Risk_Label'] = 1
            df.at[idx, 'Fraud_Type'] = "Device Spoofing (Buddy Punching)"
        return df

if __name__ == "__main__":
    generator = HakikiDataGenerator(num_records=50000)
    df = generator.generate_dataset()
    
    # Save
    filename = "hakiki_v2_synthetic_payroll.csv"
    df.to_csv(filename, index=False)
    print(f"\n✅ SUCCESS: Generated {len(df)} rows in '{filename}'")
    print("------------------------------------------------")
    print("FRAUD STATS:")
    print(df['Fraud_Type'].value_counts())
