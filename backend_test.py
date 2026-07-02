import requests
import sys
from datetime import datetime

class BackendAPITester:
    def __init__(self, base_url="https://critique-central-2.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, validate_response=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            
            if success and validate_response:
                try:
                    response_data = response.json()
                    validation_result = validate_response(response_data)
                    if not validation_result:
                        success = False
                        print(f"❌ Failed - Response validation failed")
                        self.test_results.append({
                            "test": name,
                            "status": "FAILED",
                            "reason": "Response validation failed"
                        })
                        return False, {}
                except Exception as e:
                    success = False
                    print(f"❌ Failed - Validation error: {str(e)}")
                    self.test_results.append({
                        "test": name,
                        "status": "FAILED",
                        "reason": f"Validation error: {str(e)}"
                    })
                    return False, {}
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                self.test_results.append({
                    "test": name,
                    "status": "PASSED"
                })
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.test_results.append({
                    "test": name,
                    "status": "FAILED",
                    "reason": f"Expected {expected_status}, got {response.status_code}"
                })

            return success, response.json() if success else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                "test": name,
                "status": "FAILED",
                "reason": str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test GET /api/ returns Hello World"""
        def validate(data):
            if data.get("message") != "Hello World":
                print(f"   Expected message 'Hello World', got '{data.get('message')}'")
                return False
            return True
        
        success, response = self.run_test(
            "GET /api/ - Root endpoint",
            "GET",
            "",
            200,
            validate_response=validate
        )
        return success

    def test_create_status_check(self):
        """Test POST /api/status creates a StatusCheck"""
        test_client_name = f"test_client_{datetime.now().strftime('%H%M%S')}"
        
        def validate(data):
            if not data.get("id"):
                print("   Missing 'id' field in response")
                return False
            if data.get("client_name") != test_client_name:
                print(f"   Expected client_name '{test_client_name}', got '{data.get('client_name')}'")
                return False
            if not data.get("timestamp"):
                print("   Missing 'timestamp' field in response")
                return False
            print(f"   Created StatusCheck with id: {data.get('id')}")
            return True
        
        success, response = self.run_test(
            "POST /api/status - Create StatusCheck",
            "POST",
            "status",
            200,
            data={"client_name": test_client_name},
            validate_response=validate
        )
        return success, response.get('id') if success else None

    def test_get_status_checks(self, expected_id=None):
        """Test GET /api/status returns list of StatusChecks"""
        def validate(data):
            if not isinstance(data, list):
                print(f"   Expected list, got {type(data)}")
                return False
            if len(data) == 0:
                print("   Warning: No status checks found")
                return True
            
            # Check if the expected_id is in the list
            if expected_id:
                found = any(check.get('id') == expected_id for check in data)
                if not found:
                    print(f"   Expected to find status check with id '{expected_id}' in list")
                    return False
                print(f"   Found status check with id '{expected_id}' in list")
            
            # Validate structure of first item
            first_item = data[0]
            if not first_item.get("id"):
                print("   First item missing 'id' field")
                return False
            if not first_item.get("client_name"):
                print("   First item missing 'client_name' field")
                return False
            if not first_item.get("timestamp"):
                print("   First item missing 'timestamp' field")
                return False
            
            print(f"   Found {len(data)} status check(s)")
            return True
        
        success, response = self.run_test(
            "GET /api/status - Get all StatusChecks",
            "GET",
            "status",
            200,
            validate_response=validate
        )
        return success

def main():
    print("=" * 60)
    print("Backend API Testing - Code Quality Fixes Verification")
    print("=" * 60)
    
    tester = BackendAPITester()
    
    # Test 1: Root endpoint
    print("\n--- Test 1: Root Endpoint ---")
    tester.test_root_endpoint()
    
    # Test 2: Create status check
    print("\n--- Test 2: Create Status Check ---")
    success, status_id = tester.test_create_status_check()
    
    # Test 3: Get status checks
    print("\n--- Test 3: Get Status Checks ---")
    tester.test_get_status_checks(expected_id=status_id if success else None)
    
    # Print summary
    print("\n" + "=" * 60)
    print(f"📊 Test Summary: {tester.tests_passed}/{tester.tests_run} tests passed")
    print("=" * 60)
    
    if tester.tests_passed == tester.tests_run:
        print("✅ All backend tests passed!")
        return 0
    else:
        print("❌ Some backend tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
