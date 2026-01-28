import requests
import time

url = "http://localhost:8000/api/audit/scan"
files = {'file': ('test_upload.csv', b'EmployeeID,Name,Department\n1,Test,Dept')}

print(f"Testing {url}...")
try:
    # Retry loop in case server is still starting
    for i in range(5):
        try:
            r = requests.post(url, files=files)
            print(f"Status Code: {r.status_code}")
            print(f"Response: {r.json()}")
            if r.status_code == 200:
                print("✅ VERIFICATION SUCCESS")
                break
        except requests.exceptions.ConnectionError:
            print(f"Connection failed, retrying {i+1}/5...")
            time.sleep(2)
    else:
        print("❌ VERIFICATION FAILED: Could not connect after retries")

except Exception as e:
    print(f"❌ VERIFICATION ERROR: {e}")
