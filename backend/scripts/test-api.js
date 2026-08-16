'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

let adminToken = '';
let ownerToken = '';
let userToken = '';
let createdStoreId = null;
let createdUserId = null;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting API & Security Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${details}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await request('GET', '/health');
    assert(healthRes.status === 200 && healthRes.body.status === 'OK', 'GET /api/health returns 200 OK');

    // 2. Admin Login
    const adminLogin = await request('POST', '/auth/login', { email: 'admin@storerating.com', password: 'Admin@1234' });
    assert(adminLogin.status === 200 && adminLogin.body.data.token, 'Admin login succeeds');
    adminToken = adminLogin.body.data?.token || '';
    assert(adminLogin.body.data?.user?.role === 'admin', 'Admin role returned correctly in login response');
    assert(!adminLogin.body.data?.user?.password && !adminLogin.body.data?.user?.password_hash, 'Password is not exposed in login response');

    // 3. Store Owner Login
    const ownerLogin = await request('POST', '/auth/login', { email: 'owner@storerating.com', password: 'Owner@1234' });
    assert(ownerLogin.status === 200 && ownerLogin.body.data.token, 'Store Owner login succeeds');
    ownerToken = ownerLogin.body.data?.token || '';

    // 4. Normal User Login
    const userLogin = await request('POST', '/auth/login', { email: 'user1@storerating.com', password: 'User@1234' });
    assert(userLogin.status === 200 && userLogin.body.data.token, 'Normal User login succeeds');
    userToken = userLogin.body.data?.token || '';

    // 5. Admin Dashboard
    const adminDash = await request('GET', '/admin/dashboard', null, adminToken);
    assert(adminDash.status === 200, 'GET /api/admin/dashboard returns 200');
    assert(
      typeof adminDash.body.data.totalUsers === 'number' &&
      typeof adminDash.body.data.totalStores === 'number' &&
      typeof adminDash.body.data.totalRatings === 'number',
      'Admin dashboard contains totalUsers, totalStores, totalRatings'
    );

    // 6. Admin Create Normal User, Admin, Store Owner
    const newNormalUserEmail = `testuser_${Date.now()}@storerating.com`;
    const createUserRes = await request('POST', '/admin/users', {
      name: 'Testing Normal User Account Name',
      email: newNormalUserEmail,
      password: 'TestPassword@123',
      address: '123 Test Street, Test City',
      role: 'USER',
    }, adminToken);
    assert(createUserRes.status === 201, 'Admin can create a Normal User');
    createdUserId = createUserRes.body.data?.id;

    // 7. Admin List Users with Filter & Sort
    const listUsersRes = await request('GET', '/admin/users?role=user&sortBy=name&sortOrder=ASC', null, adminToken);
    assert(listUsersRes.status === 200 && Array.isArray(listUsersRes.body.data.rows), 'Admin can list users with role filter and sorting');

    // 8. Admin Get User Details (Owner Details include store rating summary)
    const [ownerUser] = (await request('GET', '/admin/users?role=owner', null, adminToken)).body.data.rows;
    if (ownerUser) {
      const ownerDetailsRes = await request('GET', `/admin/users/${ownerUser.id}`, null, adminToken);
      assert(ownerDetailsRes.status === 200, 'Admin can get user details');
      assert(ownerDetailsRes.body.data.store_rating_summary !== undefined, 'Store Owner user details include store rating summary');
      assert(!ownerDetailsRes.body.data.password, 'Password hash is omitted from user details');
    }

    // 9. Admin Create Store
    const newStoreEmail = `teststore_${Date.now()}@storerating.com`;
    const createStoreRes = await request('POST', '/admin/stores', {
      name: 'Test Grand Store Location',
      email: newStoreEmail,
      address: '99 Commercial Boulevard, City Center',
      owner_id: ownerLogin.body.data.user.id,
    }, adminToken);
    assert(createStoreRes.status === 201, 'Admin can create a Store linked to Store Owner');
    createdStoreId = createStoreRes.body.data?.id;

    // 10. Admin List Stores with Filter & Sort
    const listStoresRes = await request('GET', '/admin/stores?name=Test&sortBy=name&sortOrder=ASC', null, adminToken);
    assert(listStoresRes.status === 200 && Array.isArray(listStoresRes.body.data.rows), 'Admin can list stores with search and sorting');

    // 11. Normal User Registration via Public Register Endpoint
    const publicUserEmail = `publicuser_${Date.now()}@storerating.com`;
    const regRes = await request('POST', '/auth/register', {
      name: 'Publicly Registered User Account',
      email: publicUserEmail,
      password: 'UserPass@1234',
      address: '77 Public Way, Townsville',
    });
    assert(regRes.status === 201 && regRes.body.data.role === 'user', 'Public registration automatically assigns USER role');

    // 12. Rating Validation Tests (0 and 6 rejected)
    if (createdStoreId) {
      const invalidRating0 = await request('POST', `/stores/${createdStoreId}/ratings`, { rating: 0 }, userToken);
      assert(invalidRating0.status === 400, 'Rating value 0 is rejected with 400 Bad Request');

      const invalidRating6 = await request('POST', `/stores/${createdStoreId}/ratings`, { rating: 6 }, userToken);
      assert(invalidRating6.status === 400, 'Rating value 6 is rejected with 400 Bad Request');

      // Valid Rating Submission (5 stars)
      const validRating5 = await request('POST', `/stores/${createdStoreId}/ratings`, { rating: 5 }, userToken);
      assert(validRating5.status === 201, 'Normal User can submit rating 5 for store');

      // Duplicate Rating Submission (rejected with 409 Conflict)
      const dupRating = await request('POST', `/stores/${createdStoreId}/ratings`, { rating: 5 }, userToken);
      assert(dupRating.status === 409, 'Duplicate rating submission by same user is rejected with 409 Conflict');

      // Modify Rating (4 stars)
      const updateRating4 = await request('PUT', `/stores/${createdStoreId}/ratings`, { rating: 4 }, userToken);
      assert(updateRating4.status === 200 && updateRating4.body.data.rating === 4, 'Normal User can modify their rating to 4');
    }

    // 13. Store Owner Dashboard
    const ownerDashRes = await request('GET', '/store-owner/dashboard', null, ownerToken);
    assert(ownerDashRes.status === 200, 'Store Owner can fetch their store dashboard');
    assert(ownerDashRes.body.data.hasStore === true, 'Store Owner dashboard returns their assigned store');

    // 14. Store Owner Ratings
    const ownerRatingsRes = await request('GET', '/store-owner/ratings', null, ownerToken);
    assert(ownerRatingsRes.status === 200 && Array.isArray(ownerRatingsRes.body.data.rows), 'Store Owner can view customer ratings for their store');

    // 15. RBAC Security Enforcement Tests
    const userToAdmin = await request('GET', '/admin/dashboard', null, userToken);
    assert(userToAdmin.status === 403, 'RBAC: USER cannot access ADMIN API (403 Forbidden)');

    const userToOwner = await request('GET', '/store-owner/dashboard', null, userToken);
    assert(userToOwner.status === 403, 'RBAC: USER cannot access STORE OWNER API (403 Forbidden)');

    const ownerToAdmin = await request('GET', '/admin/dashboard', null, ownerToken);
    assert(ownerToAdmin.status === 403, 'RBAC: STORE OWNER cannot access ADMIN API (403 Forbidden)');

    const unauthReq = await request('GET', '/admin/dashboard', null, null);
    assert(unauthReq.status === 401, 'RBAC: Unauthenticated request is rejected (401 Unauthorized)');

    // 16. Change Password
    const changePwRes = await request('POST', '/auth/change-password', {
      currentPassword: 'UserPass@1234',
      newPassword: 'NewUserPass@1234',
    }, (await request('POST', '/auth/login', { email: publicUserEmail, password: 'UserPass@1234' })).body.data.token);
    assert(changePwRes.status === 200, 'User can change their password');

    const newLoginRes = await request('POST', '/auth/login', { email: publicUserEmail, password: 'NewUserPass@1234' });
    assert(newLoginRes.status === 200, 'User can log in with new password after change');

    console.log(`\n============================================================`);
    console.log(`Test Execution Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`============================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Test Execution Error:', err);
    process.exit(1);
  }
}

runTests();
