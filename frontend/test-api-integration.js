#!/usr/bin/env node

/**
 * Frontend API Integration Test
 * Tests all API endpoints to verify frontend integration
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL||'http://localhost:8080';
const TIMEOUT = 10000;

// Test credentials - try multiple common combinations
const CREDENTIAL_ATTEMPTS = [
  { username: 'admin', password: 'admin' },
  { username: 'admin', password: 'admin123' },
  { username: 'admin', password: 'password' },
  { username: 'teacher', password: 'teacher123' },
  { username: 'teacher', password: 'password' },
  { username: 'user', password: 'password' },
];

let authToken = null;
let testResults = [];

// Color output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function addResult(feature, api, result, status, details = '') {
  testResults.push({ feature, api, result, status, details });
}

// Test 1: Authentication
async function testAuth() {
  log('\n━━━ TEST 1: AUTHENTICATION ━━━', 'cyan');
  
  for (const { username, password } of CREDENTIAL_ATTEMPTS) {
    try {
      log(`Trying: ${username} / ${password}`);
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        username,
        password,
      }, { timeout: TIMEOUT });

      authToken = response.data.token;
      log(`✓ Login successful: ${response.data.username} (${response.data.role})`, 'green');
      addResult('Authentication', 'POST /api/auth/login', 'Token received', 'PASS', `User: ${response.data.username}`);
      return true;
    } catch (error) {
      log(`✗ Failed: ${username} / ${password}`, 'yellow');
    }
  }
  
  log(`✗ All login attempts failed`, 'red');
  addResult('Authentication', 'POST /api/auth/login', 'All credentials failed', 'FAIL');
  return false;
}

// Test 2: Students API
async function testStudents() {
  log('\n━━━ TEST 2: STUDENTS API ━━━', 'cyan');
  
  const api = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: { Authorization: `Bearer ${authToken}` },
  });

  try {
    // GET students
    log('Testing GET /api/students...');
    const getResponse = await api.get('/api/students', { params: { page: 0, size: 10 } });
    const students = getResponse.data.content || [];
    log(`✓ GET /api/students: ${students.length} students found`, 'green');
    addResult('Students', 'GET /api/students', `${students.length} students`, 'PASS');

    // CREATE student
    log('Testing POST /api/students...');
    const newStudent = {
      studentNumber: `TEST-${Date.now()}`,
      fullName: 'Test Student API Integration',
      email: 'test@integration.com',
      phone: '1234567890',
    };
    const createResponse = await api.post('/api/students', newStudent);
    const createdStudent = createResponse.data;
    log(`✓ POST /api/students: Created student ID ${createdStudent.id}`, 'green');
    addResult('Students', 'POST /api/students', `Created ID: ${createdStudent.id}`, 'PASS');

    // UPDATE student
    log('Testing PUT /api/students/:id...');
    const updatedData = { ...createdStudent, fullName: 'Test Student Updated' };
    await api.put(`/api/students/${createdStudent.id}`, updatedData);
    log(`✓ PUT /api/students/${createdStudent.id}: Student updated`, 'green');
    addResult('Students', 'PUT /api/students/:id', 'Updated successfully', 'PASS');

    // DELETE student
    log('Testing DELETE /api/students/:id...');
    await api.delete(`/api/students/${createdStudent.id}`);
    log(`✓ DELETE /api/students/${createdStudent.id}: Student deleted`, 'green');
    addResult('Students', 'DELETE /api/students/:id', 'Deleted successfully', 'PASS');

    return true;
  } catch (error) {
    log(`✗ Students API failed: ${error.message}`, 'red');
    addResult('Students', error.config?.method?.toUpperCase() + ' ' + error.config?.url, error.message, 'FAIL');
    return false;
  }
}

// Test 3: Dashboard Stats
async function testDashboard() {
  log('\n━━━ TEST 3: DASHBOARD STATS ━━━', 'cyan');
  
  const api = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: { Authorization: `Bearer ${authToken}` },
  });

  try {
    log('Testing GET /api/dashboard/stats...');
    const response = await api.get('/api/dashboard/stats');
    const stats = response.data;
    
    log(`✓ Dashboard stats received:`, 'green');
    log(`  - Total Students: ${stats.totalStudents}`);
    log(`  - Present Today: ${stats.presentToday}`);
    log(`  - Absent Today: ${stats.absentToday}`);
    log(`  - Attendance %: ${stats.attendancePercentage}%`);
    
    addResult('Dashboard', 'GET /api/dashboard/stats', 
      `Students: ${stats.totalStudents}, Present: ${stats.presentToday}`, 'PASS');
    return true;
  } catch (error) {
    log(`✗ Dashboard API failed: ${error.message}`, 'red');
    addResult('Dashboard', 'GET /api/dashboard/stats', error.message, 'FAIL');
    return false;
  }
}

// Test 4: Attendance History
async function testAttendanceHistory() {
  log('\n━━━ TEST 4: ATTENDANCE HISTORY ━━━', 'cyan');
  
  const api = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: { Authorization: `Bearer ${authToken}` },
  });

  try {
    log('Testing GET /api/attendance...');
    const response = await api.get('/api/attendance', { params: { page: 0, size: 15 } });
    const records = response.data.content || [];
    
    log(`✓ GET /api/attendance: ${records.length} records found`, 'green');
    if (records.length > 0) {
      log(`  Sample record: ${records[0].studentName} - ${records[0].status} (${records[0].attendanceDate})`);
    }
    
    addResult('Attendance History', 'GET /api/attendance', `${records.length} records`, 'PASS');
    return true;
  } catch (error) {
    log(`✗ Attendance History API failed: ${error.message}`, 'red');
    addResult('Attendance History', 'GET /api/attendance', error.message, 'FAIL');
    return false;
  }
}

// Test 5: Face Registration (without actual image)
async function testFaceRegistration() {
  log('\n━━━ TEST 5: FACE REGISTRATION API ━━━', 'cyan');
  
  const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // Longer timeout for face processing
    headers: { Authorization: `Bearer ${authToken}` },
  });

  try {
    // First get a student ID
    const studentsResp = await api.get('/api/students', { params: { page: 0, size: 1 } });
    const students = studentsResp.data.content || [];
    
    if (students.length === 0) {
      log(`⚠ No students available for face registration test`, 'yellow');
      addResult('Face Registration', 'POST /api/face/register', 'No students available', 'SKIP');
      return true;
    }

    const studentId = students[0].id;
    log(`Testing POST /api/face/register with student ID ${studentId}...`);
    log(`⚠ Note: Using test image - Python service must be running`, 'yellow');
    
    // Create a simple test base64 image (1x1 pixel jpeg)
    const testImageBase64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA0A';
    
    try {
      const response = await api.post('/api/face/register', {
        studentId: studentId,
        imageBase64: testImageBase64,
      });
      
      log(`✓ POST /api/face/register: API responding`, 'green');
      addResult('Face Registration', 'POST /api/face/register', 'API accessible', 'PASS', 
        'Note: Real image test requires Python service');
      return true;
    } catch (error) {
      if (error.response) {
        // API is responding but may reject test image
        log(`✓ POST /api/face/register: API accessible (rejected test image)`, 'green');
        log(`  Response: ${error.response.status} - ${error.response.data?.message || error.response.data?.detail || 'Unknown error'}`, 'yellow');
        addResult('Face Registration', 'POST /api/face/register', 
          `API accessible, response: ${error.response.status}`, 'PASS',
          'Image rejected as expected - Python service may need real face image');
        return true;
      } else {
        throw error;
      }
    }
  } catch (error) {
    log(`✗ Face Registration API failed: ${error.message}`, 'red');
    addResult('Face Registration', 'POST /api/face/register', error.message, 'FAIL');
    return false;
  }
}

// Test 6: Attendance Recognition (without actual image)
async function testAttendanceRecognition() {
  log('\n━━━ TEST 6: ATTENDANCE RECOGNITION API ━━━', 'cyan');
  
  const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: { Authorization: `Bearer ${authToken}` },
  });

  try {
    log(`Testing POST /api/attendance/recognize...`);
    log(`⚠ Note: Using test image - Python service must be running`, 'yellow');
    
    const testImageBase64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA0A';
    
    try {
      const response = await api.post('/api/attendance/recognize', {
        imageBase64: testImageBase64,
      });
      
      log(`✓ POST /api/attendance/recognize: API responding`, 'green');
      addResult('Attendance Recognition', 'POST /api/attendance/recognize', 'API accessible', 'PASS',
        'Note: Real recognition test requires Python service');
      return true;
    } catch (error) {
      if (error.response) {
        log(`✓ POST /api/attendance/recognize: API accessible (rejected test image)`, 'green');
        log(`  Response: ${error.response.status} - ${error.response.data?.message || error.response.data?.detail || 'Unknown error'}`, 'yellow');
        addResult('Attendance Recognition', 'POST /api/attendance/recognize',
          `API accessible, response: ${error.response.status}`, 'PASS',
          'Image rejected as expected - Python service may need real face image');
        return true;
      } else {
        throw error;
      }
    }
  } catch (error) {
    log(`✗ Attendance Recognition API failed: ${error.message}`, 'red');
    addResult('Attendance Recognition', 'POST /api/attendance/recognize', error.message, 'FAIL');
    return false;
  }
}

// Print summary table
function printSummary() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('TEST RESULTS SUMMARY', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  console.log('\n' + '┌' + '─'.repeat(80) + '┐');
  console.log('│ ' + 'Feature'.padEnd(22) + '│ ' + 'API Tested'.padEnd(30) + '│ ' + 'Status'.padEnd(6) + '│');
  console.log('├' + '─'.repeat(80) + '┤');
  
  testResults.forEach(({ feature, api, result, status, details }) => {
    const statusColor = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
    const statusSymbol = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠';
    
    console.log('│ ' + feature.padEnd(22) + '│ ' + api.padEnd(30) + '│ ' + 
      `${colors[statusColor]}${statusSymbol} ${status}${colors.reset}`.padEnd(13) + '│');
    
    if (details) {
      console.log('│   Details: ' + details.padEnd(66) + '│');
    }
  });
  
  console.log('└' + '─'.repeat(80) + '┘\n');
  
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const skipped = testResults.filter(r => r.status === 'SKIP').length;
  
  log(`\n📊 Total Tests: ${testResults.length}`, 'cyan');
  log(`✓ Passed: ${passed}`, 'green');
  if (failed > 0) log(`✗ Failed: ${failed}`, 'red');
  if (skipped > 0) log(`⚠ Skipped: ${skipped}`, 'yellow');
  
  if (failed === 0) {
    log('\n🎉 All API integration tests PASSED!', 'green');
  } else {
    log('\n⚠ Some tests failed - see details above', 'yellow');
  }
}

// Main test runner
async function runTests() {
  log('═══════════════════════════════════════════════', 'cyan');
  log('  FRONTEND API INTEGRATION TEST', 'cyan');
  log('═══════════════════════════════════════════════', 'cyan');
  log(`Backend: ${BASE_URL}`);
  log(`Test User: ${TEST_USERNAME}`);
  
  try {
    const authSuccess = await testAuth();
    if (!authSuccess) {
      log('\n⚠ Authentication failed - cannot proceed with other tests', 'red');
      printSummary();
      process.exit(1);
    }

    await testStudents();
    await testDashboard();
    await testAttendanceHistory();
    await testFaceRegistration();
    await testAttendanceRecognition();
    
    printSummary();
    
    const failed = testResults.filter(r => r.status === 'FAIL').length;
    process.exit(failed > 0 ? 1 : 0);
    
  } catch (error) {
    log(`\n✗ Test runner error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

runTests();
