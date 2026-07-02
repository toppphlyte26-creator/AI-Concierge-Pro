"""FinSight Backend API Testing Suite"""
import requests
import sys
import base64
import io
from datetime import datetime, date, timedelta
from PIL import Image, ImageDraw, ImageFont

class FinSightAPITester:
    def __init__(self, base_url="https://critique-central-2.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, validate_response=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        req_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            req_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            req_headers.update(headers)
        
        # Remove Content-Type for multipart/form-data
        if files:
            req_headers.pop('Content-Type', None)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=req_headers, timeout=15)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, headers=req_headers, timeout=15)
                else:
                    response = requests.post(url, json=data, headers=req_headers, timeout=15)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=req_headers, timeout=15)
            elif method == 'DELETE':
                response = requests.delete(url, headers=req_headers, timeout=15)

            success = response.status_code == expected_status
            
            if success and validate_response:
                try:
                    response_data = response.json() if response.text else {}
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
                print(f"   Response: {response.text[:300]}")
                self.test_results.append({
                    "test": name,
                    "status": "FAILED",
                    "reason": f"Expected {expected_status}, got {response.status_code}",
                    "response": response.text[:300]
                })

            try:
                return success, response.json() if response.text else {}
            except:
                return success, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                "test": name,
                "status": "FAILED",
                "reason": str(e)
            })
            return False, {}

    # ==================== Auth Tests ====================
    def test_signup(self):
        """Test POST /api/auth/signup"""
        test_email = f"testagent{datetime.now().strftime('%H%M%S')}@finsight.app"
        
        def validate(data):
            if not data.get("token"):
                print("   Missing 'token' field")
                return False
            if not data.get("user"):
                print("   Missing 'user' field")
                return False
            user = data["user"]
            if user.get("email") != test_email:
                print(f"   Email mismatch: {user.get('email')} != {test_email}")
                return False
            print(f"   Created user: {user.get('id')}, email: {user.get('email')}")
            return True
        
        success, response = self.run_test(
            "POST /api/auth/signup - Create user with seeded data",
            "POST",
            "auth/signup",
            200,
            data={"email": test_email, "password": "test1234", "name": "Test Agent"},
            validate_response=validate
        )
        
        if success:
            self.token = response.get("token")
            self.user_id = response.get("user", {}).get("id")
        
        return success

    def test_login_success(self):
        """Test POST /api/auth/login with correct credentials"""
        # Create a new user first
        test_email = f"logintest{datetime.now().strftime('%H%M%S')}@finsight.app"
        test_password = "test1234"
        
        # Signup
        requests.post(
            f"{self.base_url}/auth/signup",
            json={"email": test_email, "password": test_password},
            timeout=10
        )
        
        def validate(data):
            if not data.get("token"):
                print("   Missing 'token' field")
                return False
            if not data.get("user"):
                print("   Missing 'user' field")
                return False
            print(f"   Login successful, token received")
            return True
        
        success, response = self.run_test(
            "POST /api/auth/login - Login with correct credentials",
            "POST",
            "auth/login",
            200,
            data={"email": test_email, "password": test_password},
            validate_response=validate
        )
        return success

    def test_login_wrong_password(self):
        """Test POST /api/auth/login with wrong password returns 401"""
        success, _ = self.run_test(
            "POST /api/auth/login - Wrong password returns 401",
            "POST",
            "auth/login",
            401,
            data={"email": "test@finsight.app", "password": "wrongpassword"}
        )
        return success

    def test_get_me(self):
        """Test GET /api/auth/me returns current user"""
        def validate(data):
            if not data.get("id"):
                print("   Missing 'id' field")
                return False
            if not data.get("email"):
                print("   Missing 'email' field")
                return False
            print(f"   User: {data.get('email')}, base_currency: {data.get('base_currency')}")
            return True
        
        success, _ = self.run_test(
            "GET /api/auth/me - Get current user",
            "GET",
            "auth/me",
            200,
            validate_response=validate
        )
        return success

    def test_update_settings(self):
        """Test PATCH /api/auth/me - Update name and base_currency"""
        def validate(data):
            if data.get("name") != "Updated Name":
                print(f"   Name not updated: {data.get('name')}")
                return False
            if data.get("base_currency") != "EUR":
                print(f"   Currency not updated: {data.get('base_currency')}")
                return False
            print(f"   Settings updated: name={data.get('name')}, currency={data.get('base_currency')}")
            return True
        
        success, _ = self.run_test(
            "PATCH /api/auth/me - Update settings",
            "PATCH",
            "auth/me",
            200,
            data={"name": "Updated Name", "base_currency": "EUR"},
            validate_response=validate
        )
        return success

    # ==================== Transaction Tests ====================
    def test_list_transactions(self):
        """Test GET /api/transactions - Should return seeded transactions"""
        def validate(data):
            if not isinstance(data, list):
                print(f"   Expected list, got {type(data)}")
                return False
            if len(data) == 0:
                print("   Warning: No transactions found (seed might have failed)")
                return True
            print(f"   Found {len(data)} transactions")
            # Validate first transaction structure
            tx = data[0]
            required = ["id", "user_id", "description", "amount", "currency", "category", "date", "type"]
            for field in required:
                if field not in tx:
                    print(f"   Missing field: {field}")
                    return False
            return True
        
        success, _ = self.run_test(
            "GET /api/transactions - List transactions",
            "GET",
            "transactions",
            200,
            validate_response=validate
        )
        return success

    def test_create_transaction_with_category(self):
        """Test POST /api/transactions - Create with manual category"""
        def validate(data):
            if not data.get("id"):
                print("   Missing 'id' field")
                return False
            if data.get("description") != "Test Coffee":
                print(f"   Description mismatch: {data.get('description')}")
                return False
            if data.get("category") != "Food & Drink":
                print(f"   Category mismatch: {data.get('category')}")
                return False
            print(f"   Created transaction: {data.get('id')}, category: {data.get('category')}")
            return True
        
        success, response = self.run_test(
            "POST /api/transactions - Create with manual category",
            "POST",
            "transactions",
            200,
            data={
                "description": "Test Coffee",
                "amount": 5.50,
                "currency": "USD",
                "category": "Food & Drink",
                "date": date.today().isoformat(),
                "type": "expense"
            },
            validate_response=validate
        )
        return success, response.get("id") if success else None

    def test_create_transaction_auto_categorize(self):
        """Test POST /api/transactions - Auto-categorize via AI"""
        def validate(data):
            if not data.get("id"):
                print("   Missing 'id' field")
                return False
            if not data.get("category"):
                print("   Missing 'category' field")
                return False
            print(f"   Created transaction: {data.get('id')}, auto-category: {data.get('category')}")
            return True
        
        success, _ = self.run_test(
            "POST /api/transactions - Auto-categorize (AI)",
            "POST",
            "transactions",
            200,
            data={
                "description": "Uber ride to downtown",
                "amount": 15.00,
                "currency": "USD",
                "date": date.today().isoformat(),
                "type": "expense"
            },
            validate_response=validate
        )
        return success

    def test_update_transaction(self, tx_id):
        """Test PATCH /api/transactions/{id}"""
        def validate(data):
            if data.get("amount") != 6.50:
                print(f"   Amount not updated: {data.get('amount')}")
                return False
            print(f"   Transaction updated: amount={data.get('amount')}")
            return True
        
        success, _ = self.run_test(
            "PATCH /api/transactions/{id} - Update transaction",
            "PATCH",
            f"transactions/{tx_id}",
            200,
            data={"amount": 6.50},
            validate_response=validate
        )
        return success

    def test_delete_transaction(self, tx_id):
        """Test DELETE /api/transactions/{id}"""
        def validate(data):
            if not data.get("ok"):
                print("   Delete did not return ok=True")
                return False
            return True
        
        success, _ = self.run_test(
            "DELETE /api/transactions/{id} - Delete transaction",
            "DELETE",
            f"transactions/{tx_id}",
            200,
            validate_response=validate
        )
        return success

    def test_filter_transactions(self):
        """Test GET /api/transactions with filters"""
        success, _ = self.run_test(
            "GET /api/transactions?type=expense - Filter by type",
            "GET",
            "transactions?type=expense",
            200
        )
        return success

    # ==================== AI Tests ====================
    def test_ai_categorize(self):
        """Test POST /api/ai/categorize"""
        def validate(data):
            if not data.get("category"):
                print("   Missing 'category' field")
                return False
            print(f"   AI suggested category: {data.get('category')}")
            return True
        
        success, _ = self.run_test(
            "POST /api/ai/categorize - AI category suggestion",
            "POST",
            "ai/categorize",
            200,
            data={"description": "Starbucks coffee"},
            validate_response=validate
        )
        return success

    def test_receipt_scan(self):
        """Test POST /api/receipts/scan with image"""
        # Create a realistic receipt image
        img = Image.new('RGB', (400, 600), color='white')
        draw = ImageDraw.Draw(img)
        
        # Draw receipt content
        draw.text((20, 20), "STARBUCKS COFFEE", fill='black')
        draw.text((20, 50), "123 Main St, San Francisco", fill='black')
        draw.text((20, 80), "Date: 2025-08-15", fill='black')
        draw.text((20, 120), "Latte Grande      $5.50", fill='black')
        draw.text((20, 150), "Croissant         $3.50", fill='black')
        draw.text((20, 180), "Tax               $0.72", fill='black')
        draw.text((20, 220), "TOTAL            $9.72", fill='black')
        draw.text((20, 250), "Thank you!", fill='black')
        
        # Save to bytes
        buf = io.BytesIO()
        img.save(buf, format='JPEG', quality=90)
        image_bytes = buf.getvalue()
        
        def validate(data):
            if "merchant" not in data:
                print("   Missing 'merchant' field")
                return False
            if "total_amount" not in data:
                print("   Missing 'total_amount' field")
                return False
            if "category" not in data:
                print("   Missing 'category' field")
                return False
            print(f"   Extracted: merchant={data.get('merchant')}, amount={data.get('total_amount')}, category={data.get('category')}")
            return True
        
        success, _ = self.run_test(
            "POST /api/receipts/scan - Scan receipt image",
            "POST",
            "receipts/scan",
            200,
            files={'file': ('receipt.jpg', image_bytes, 'image/jpeg')},
            validate_response=validate
        )
        return success

    # ==================== Budget Tests ====================
    def test_list_budgets(self):
        """Test GET /api/budgets - Should return seeded budgets"""
        def validate(data):
            if not isinstance(data, list):
                print(f"   Expected list, got {type(data)}")
                return False
            print(f"   Found {len(data)} budgets")
            return True
        
        success, _ = self.run_test(
            "GET /api/budgets - List budgets",
            "GET",
            "budgets",
            200,
            validate_response=validate
        )
        return success

    def test_create_budget(self):
        """Test POST /api/budgets"""
        current_month = date.today().strftime("%Y-%m")
        
        def validate(data):
            if not data.get("id"):
                print("   Missing 'id' field")
                return False
            if data.get("category") != "Health":
                print(f"   Category mismatch: {data.get('category')}")
                return False
            print(f"   Created budget: {data.get('id')}, category: {data.get('category')}, limit: {data.get('limit')}")
            return True
        
        success, response = self.run_test(
            "POST /api/budgets - Create budget",
            "POST",
            "budgets",
            200,
            data={
                "category": "Health",
                "limit": 250.0,
                "month": current_month
            },
            validate_response=validate
        )
        return success, response.get("id") if success else None

    def test_update_budget(self, budget_id):
        """Test PATCH /api/budgets/{id}"""
        def validate(data):
            if data.get("limit") != 300.0:
                print(f"   Limit not updated: {data.get('limit')}")
                return False
            return True
        
        success, _ = self.run_test(
            "PATCH /api/budgets/{id} - Update budget",
            "PATCH",
            f"budgets/{budget_id}",
            200,
            data={"limit": 300.0},
            validate_response=validate
        )
        return success

    def test_delete_budget(self, budget_id):
        """Test DELETE /api/budgets/{id}"""
        success, _ = self.run_test(
            "DELETE /api/budgets/{id} - Delete budget",
            "DELETE",
            f"budgets/{budget_id}",
            200
        )
        return success

    # ==================== Bills Tests ====================
    def test_list_bills(self):
        """Test GET /api/bills"""
        def validate(data):
            if not isinstance(data, list):
                print(f"   Expected list, got {type(data)}")
                return False
            print(f"   Found {len(data)} bills")
            return True
        
        success, _ = self.run_test(
            "GET /api/bills - List bills",
            "GET",
            "bills",
            200,
            validate_response=validate
        )
        return success

    def test_create_bill(self):
        """Test POST /api/bills"""
        next_due = (date.today() + timedelta(days=15)).isoformat()
        
        def validate(data):
            if not data.get("id"):
                print("   Missing 'id' field")
                return False
            if data.get("name") != "Test Bill":
                print(f"   Name mismatch: {data.get('name')}")
                return False
            print(f"   Created bill: {data.get('id')}, name: {data.get('name')}")
            return True
        
        success, response = self.run_test(
            "POST /api/bills - Create bill",
            "POST",
            "bills",
            200,
            data={
                "name": "Test Bill",
                "amount": 50.0,
                "currency": "USD",
                "frequency": "monthly",
                "next_due_date": next_due,
                "category": "Bills & Utilities"
            },
            validate_response=validate
        )
        return success, response.get("id") if success else None

    def test_update_bill(self, bill_id):
        """Test PATCH /api/bills/{id}"""
        def validate(data):
            if data.get("amount") != 55.0:
                print(f"   Amount not updated: {data.get('amount')}")
                return False
            return True
        
        success, _ = self.run_test(
            "PATCH /api/bills/{id} - Update bill",
            "PATCH",
            f"bills/{bill_id}",
            200,
            data={"amount": 55.0},
            validate_response=validate
        )
        return success

    def test_delete_bill(self, bill_id):
        """Test DELETE /api/bills/{id}"""
        success, _ = self.run_test(
            "DELETE /api/bills/{id} - Delete bill",
            "DELETE",
            f"bills/{bill_id}",
            200
        )
        return success

    # ==================== Goals Tests ====================
    def test_list_goals(self):
        """Test GET /api/goals"""
        def validate(data):
            if not isinstance(data, list):
                print(f"   Expected list, got {type(data)}")
                return False
            print(f"   Found {len(data)} goals")
            return True
        
        success, _ = self.run_test(
            "GET /api/goals - List goals",
            "GET",
            "goals",
            200,
            validate_response=validate
        )
        return success

    def test_create_goal(self):
        """Test POST /api/goals"""
        target_date = (date.today() + timedelta(days=180)).isoformat()
        
        def validate(data):
            if not data.get("id"):
                print("   Missing 'id' field")
                return False
            if data.get("name") != "Test Goal":
                print(f"   Name mismatch: {data.get('name')}")
                return False
            print(f"   Created goal: {data.get('id')}, name: {data.get('name')}")
            return True
        
        success, response = self.run_test(
            "POST /api/goals - Create goal",
            "POST",
            "goals",
            200,
            data={
                "name": "Test Goal",
                "target_amount": 1000.0,
                "current_amount": 100.0,
                "currency": "USD",
                "target_date": target_date
            },
            validate_response=validate
        )
        return success, response.get("id") if success else None

    def test_contribute_goal(self, goal_id):
        """Test POST /api/goals/{id}/contribute"""
        def validate(data):
            if data.get("current_amount") < 100.0:
                print(f"   Current amount not increased: {data.get('current_amount')}")
                return False
            print(f"   Contribution successful: current_amount={data.get('current_amount')}")
            return True
        
        success, _ = self.run_test(
            "POST /api/goals/{id}/contribute - Add contribution",
            "POST",
            f"goals/{goal_id}/contribute",
            200,
            data={"amount": 50.0},
            validate_response=validate
        )
        return success

    def test_update_goal(self, goal_id):
        """Test PATCH /api/goals/{id}"""
        def validate(data):
            if data.get("target_amount") != 1200.0:
                print(f"   Target amount not updated: {data.get('target_amount')}")
                return False
            return True
        
        success, _ = self.run_test(
            "PATCH /api/goals/{id} - Update goal",
            "PATCH",
            f"goals/{goal_id}",
            200,
            data={"target_amount": 1200.0},
            validate_response=validate
        )
        return success

    def test_delete_goal(self, goal_id):
        """Test DELETE /api/goals/{id}"""
        success, _ = self.run_test(
            "DELETE /api/goals/{id} - Delete goal",
            "DELETE",
            f"goals/{goal_id}",
            200
        )
        return success

    # ==================== Dashboard Tests ====================
    def test_dashboard(self):
        """Test GET /api/dashboard - Aggregated data"""
        def validate(data):
            required = ["base_currency", "kpis", "trend", "category_breakdown", "budgets", "upcoming_bills", "goals"]
            for field in required:
                if field not in data:
                    print(f"   Missing field: {field}")
                    return False
            
            kpis = data["kpis"]
            if not all(k in kpis for k in ["income", "expense", "net", "savings_rate"]):
                print("   Missing KPI fields")
                return False
            
            print(f"   Dashboard loaded: income={kpis['income']}, expense={kpis['expense']}, net={kpis['net']}")
            print(f"   Trend months: {len(data['trend'])}, budgets: {len(data['budgets'])}, bills: {len(data['upcoming_bills'])}, goals: {len(data['goals'])}")
            return True
        
        success, _ = self.run_test(
            "GET /api/dashboard - Aggregated dashboard data",
            "GET",
            "dashboard",
            200,
            validate_response=validate
        )
        return success

    # ==================== Meta Tests ====================
    def test_meta_categories(self):
        """Test GET /api/meta/categories"""
        def validate(data):
            if "categories" not in data:
                print("   Missing 'categories' field")
                return False
            if "currencies" not in data:
                print("   Missing 'currencies' field")
                return False
            print(f"   Categories: {len(data['categories'])}, Currencies: {len(data['currencies'])}")
            return True
        
        success, _ = self.run_test(
            "GET /api/meta/categories - Get categories and currencies",
            "GET",
            "meta/categories",
            200,
            validate_response=validate
        )
        return success


def main():
    print("=" * 70)
    print("FinSight Backend API Testing Suite")
    print("=" * 70)
    
    tester = FinSightAPITester()
    
    # ==================== Auth Tests ====================
    print("\n" + "=" * 70)
    print("AUTH TESTS")
    print("=" * 70)
    
    if not tester.test_signup():
        print("\n❌ CRITICAL: Signup failed. Cannot proceed with authenticated tests.")
        print(f"\n📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
        return 1
    
    tester.test_login_success()
    tester.test_login_wrong_password()
    tester.test_get_me()
    tester.test_update_settings()
    
    # ==================== Transaction Tests ====================
    print("\n" + "=" * 70)
    print("TRANSACTION TESTS")
    print("=" * 70)
    
    tester.test_list_transactions()
    success, tx_id = tester.test_create_transaction_with_category()
    tester.test_create_transaction_auto_categorize()
    tester.test_filter_transactions()
    
    if tx_id:
        tester.test_update_transaction(tx_id)
        tester.test_delete_transaction(tx_id)
    
    # ==================== AI Tests ====================
    print("\n" + "=" * 70)
    print("AI TESTS")
    print("=" * 70)
    
    tester.test_ai_categorize()
    tester.test_receipt_scan()
    
    # ==================== Budget Tests ====================
    print("\n" + "=" * 70)
    print("BUDGET TESTS")
    print("=" * 70)
    
    tester.test_list_budgets()
    success, budget_id = tester.test_create_budget()
    if budget_id:
        tester.test_update_budget(budget_id)
        tester.test_delete_budget(budget_id)
    
    # ==================== Bills Tests ====================
    print("\n" + "=" * 70)
    print("BILLS TESTS")
    print("=" * 70)
    
    tester.test_list_bills()
    success, bill_id = tester.test_create_bill()
    if bill_id:
        tester.test_update_bill(bill_id)
        tester.test_delete_bill(bill_id)
    
    # ==================== Goals Tests ====================
    print("\n" + "=" * 70)
    print("GOALS TESTS")
    print("=" * 70)
    
    tester.test_list_goals()
    success, goal_id = tester.test_create_goal()
    if goal_id:
        tester.test_contribute_goal(goal_id)
        tester.test_update_goal(goal_id)
        tester.test_delete_goal(goal_id)
    
    # ==================== Dashboard Tests ====================
    print("\n" + "=" * 70)
    print("DASHBOARD TESTS")
    print("=" * 70)
    
    tester.test_dashboard()
    
    # ==================== Meta Tests ====================
    print("\n" + "=" * 70)
    print("META TESTS")
    print("=" * 70)
    
    tester.test_meta_categories()
    
    # ==================== Summary ====================
    print("\n" + "=" * 70)
    print(f"📊 FINAL RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    print("=" * 70)
    
    # Print failed tests
    failed_tests = [t for t in tester.test_results if t["status"] == "FAILED"]
    if failed_tests:
        print("\n❌ Failed Tests:")
        for test in failed_tests:
            print(f"   - {test['test']}")
            print(f"     Reason: {test.get('reason', 'Unknown')}")
    
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"\n✅ Success Rate: {success_rate:.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
