import requests
import time

url = "http://localhost:8000/api/audit/scan"
files = {'file': open('verification_payroll.csv', 'rb')}

print(f"Testing {url} with verification_payroll.csv...")
try:
    for i in range(5):
        try:
            r = requests.post(url, files=files)
            print(f"Status Code: {r.status_code}")
            if r.status_code == 200:
                print("✅ VERIFICATION SUCCESS")
                print("--- RESPONSE ---")
                print(r.json())
                print("----------------")
                break
        except requests.exceptions.ConnectionError:
            print(f"Connection failed, retrying {i+1}/5...")
            time.sleep(2)
    else:
        print("❌ VERIFICATION FAILED: Could not connect after retries")

except Exception as e:
    print(f"❌ VERIFICATION ERROR: {e}")
