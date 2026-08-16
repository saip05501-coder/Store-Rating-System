'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

let adminToken = '';
let ownerToken = '';
let userToken = '';

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

async function runAuditTests() {
  console.log('🛡️  Starting Admin Audit Trail Automated Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  try {
    // 1. Health & DB Check
    const health = await request('GET', '/health');
    assert(health.status === 200, 'Health check passes');

    // 2. Unauthenticated access to /admin/audit-logs
    const unauthRes = await request('GET', '/admin/audit-logs');
    assert(unauthRes.status === 401, 'Unauthenticated request to /admin/audit-logs is rejected (401 Unauthorized)');

    // 3. User login to obtain Normal User token
    const userLogin = await request('POST', '/auth/login', {
      email: 'user1@storerating.com',
      password: 'User@1234',
    });
    if (userLogin.status === 200 && userLogin.body?.data?.token) {
      userToken = userLogin.body.data.token;
    }

    // 4. Normal User RBAC check on /admin/audit-logs
    if (userToken) {
      const userAuditRes = await request('GET', '/admin/audit-logs', null, userToken);
      assert(userAuditRes.status === 403, 'Normal User cannot access /admin/audit-logs (403 Forbidden)');
    }

    // 5. Store Owner login to obtain Owner token
    const ownerLogin = await request('POST', '/auth/login', {
      email: 'owner@storerating.com',
      password: 'Owner@1234',
    });
    if (ownerLogin.status === 200 && ownerLogin.body?.data?.token) {
      ownerToken = ownerLogin.body.data.token;
    }

    // 6. Store Owner RBAC check on /admin/audit-logs
    if (ownerToken) {
      const ownerAuditRes = await request('GET', '/admin/audit-logs', null, ownerToken);
      assert(ownerAuditRes.status === 403, 'Store Owner cannot access /admin/audit-logs (403 Forbidden)');
    }

    // 7. Failed Admin Login triggers FAILED audit entry
    const failedLoginRes = await request('POST', '/auth/login', {
      email: 'admin@storerating.com',
      password: 'WrongPassword@999',
    });
    assert(failedLoginRes.status === 401, 'Failed admin login is rejected with 401');

    // 8. Admin login to obtain Admin token (triggers ADMIN_LOGIN_SUCCESS)
    const adminLogin = await request('POST', '/auth/login', {
      email: 'admin@storerating.com',
      password: 'Admin@1234',
    });
    assert(adminLogin.status === 200 && !!adminLogin.body?.data?.token, 'Admin logs in successfully');
    adminToken = adminLogin.body.data.token;

    // 9. Admin retrieves audit stats
    const statsRes = await request('GET', '/admin/audit-logs/stats', null, adminToken);
    assert(statsRes.status === 200 && statsRes.body.success === true, 'Admin can retrieve audit stats');
    assert(typeof statsRes.body.data.totalEvents === 'number', 'Audit stats contains totalEvents');
    assert(typeof statsRes.body.data.failedEvents === 'number', 'Audit stats contains failedEvents');

    // 10. Admin retrieves paginated audit logs
    const logsRes = await request('GET', '/admin/audit-logs?page=1&limit=10', null, adminToken);
    assert(logsRes.status === 200 && logsRes.body.success === true, 'Admin can retrieve paginated audit logs');
    assert(Array.isArray(logsRes.body.data.rows), 'Audit logs response contains data.rows array');
    assert(logsRes.body.data.pagination && logsRes.body.data.pagination.page === 1, 'Pagination metadata is returned correctly');

    // Verify actor object in response
    if (logsRes.body.data.rows.length > 0) {
      const sample = logsRes.body.data.rows[0];
      assert('actor' in sample && typeof sample.actor === 'object', 'Audit record contains sanitized actor object');
      assert('action' in sample && typeof sample.action === 'string', 'Audit record contains action string');
      assert('entityType' in sample, 'Audit record contains entityType');
      assert('ipAddress' in sample, 'Audit record contains ipAddress');
      assert('status' in sample, 'Audit record contains status');
      assert(!('password' in sample), 'Audit record does not expose passwords');
    }

    // 11. Admin creates a user -> triggers USER_CREATED
    const randomSuffix = Math.floor(Math.random() * 100000);
    const newEmail = `audittest_${randomSuffix}@test.com`;
    const createUserRes = await request(
      'POST',
      '/admin/users',
      {
        name: 'Audit Test User',
        email: newEmail,
        password: 'Password@123',
        address: '123 Audit Way',
        role: 'user',
      },
      adminToken
    );
    assert(createUserRes.status === 201, 'Admin can create new user');

    // 12. Verify USER_CREATED appears in audit logs
    const userCreatedAudit = await request(
      'GET',
      `/admin/audit-logs?action=USER_CREATED&search=${encodeURIComponent(newEmail)}`,
      null,
      adminToken
    );
    assert(
      userCreatedAudit.status === 200 && userCreatedAudit.body.data.rows.length > 0,
      'USER_CREATED audit event was recorded and searchable'
    );

    // 13. Admin creates a store -> triggers STORE_CREATED
    const storeEmail = `auditstore_${randomSuffix}@store.com`;
    const createStoreRes = await request(
      'POST',
      '/admin/stores',
      {
        name: `Audit Store ${randomSuffix}`,
        email: storeEmail,
        address: '999 Audit Blvd',
      },
      adminToken
    );
    assert(createStoreRes.status === 201, 'Admin can create new store');
    const createdStoreId = createStoreRes.body.data?.id;

    // 14. Verify STORE_CREATED appears in audit logs
    const storeCreatedAudit = await request(
      'GET',
      `/admin/audit-logs?action=STORE_CREATED&entityType=STORE`,
      null,
      adminToken
    );
    assert(
      storeCreatedAudit.status === 200 && storeCreatedAudit.body.data.rows.length > 0,
      'STORE_CREATED audit event was recorded in audit log'
    );

    // 15. Admin updates a store -> triggers STORE_UPDATED
    if (createdStoreId) {
      const updateStoreRes = await request(
        'PUT',
        `/stores/${createdStoreId}`,
        {
          name: `Audit Store Updated ${randomSuffix}`,
          address: '1000 Audit Blvd Suite B',
        },
        adminToken
      );
      assert(updateStoreRes.status === 200, 'Admin can update store details');

      // 16. Admin deletes a store -> triggers STORE_DELETED
      const deleteStoreRes = await request('DELETE', `/stores/${createdStoreId}`, null, adminToken);
      assert(deleteStoreRes.status === 200, 'Admin can delete store');

      // Verify STORE_DELETED appears in audit logs
      const storeDeletedAudit = await request(
        'GET',
        `/admin/audit-logs?action=STORE_DELETED`,
        null,
        adminToken
      );
      assert(
        storeDeletedAudit.status === 200 && storeDeletedAudit.body.data.rows.some((r) => r.entityId === createdStoreId),
        'STORE_DELETED audit event was recorded with correct entity ID'
      );
    }

    // 17. SQL Injection and Invalid Parameter Resistance
    const sqlInjectRes = await request(
      'GET',
      '/admin/audit-logs?sortBy=created_at;DROP+TABLE+users;--&sortOrder=INVALID_ORDER',
      null,
      adminToken
    );
    assert(sqlInjectRes.status === 400, 'Invalid sort parameter / SQL injection attempt safely rejected with 400');

    // 18. Append-Only / Immutability Verification: Verify PUT and DELETE to audit-logs are 404 (no mutating routes)
    const putAuditRes = await request('PUT', '/admin/audit-logs/1', { description: 'Tampered' }, adminToken);
    assert(putAuditRes.status === 404, 'PUT /api/admin/audit-logs/1 is 404 (Audit logs cannot be updated)');

    const deleteAuditRes = await request('DELETE', '/admin/audit-logs/1', null, adminToken);
    assert(deleteAuditRes.status === 404, 'DELETE /api/admin/audit-logs/1 is 404 (Audit logs cannot be deleted)');

    console.log(`\n============================================================`);
    console.log(`🛡️  Audit Trail Verification Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`============================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Audit Test Execution Error:', err);
    process.exit(1);
  }
}

runAuditTests();
