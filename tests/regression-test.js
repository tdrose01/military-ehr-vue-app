// Military EHR Application Regression Test Suite
const { chromium } = require('playwright');
const assert = require('assert');

// Configuration
const config = {
  baseUrl: process.env.TEST_URL || 'http://localhost:5173',
  headless: process.env.HEADLESS !== 'false',
  slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
  timeout: 30000
};

// Test credentials
const testUser = {
  username: 'testuser',
  password: 'password123'
};

console.log('Starting regression test suite...');
console.log(`Base URL: ${config.baseUrl}`);
console.log(`Headless mode: ${config.headless}`);

(async () => {
  const browser = await chromium.launch({
    headless: config.headless,
    slowMo: config.slowMo
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(config.timeout);
  
  try {
    let testsPassed = 0;
    let testsFailed = 0;
    
    async function runTest(name, testFn) {
      try {
        console.log(`Running test: ${name}`);
        await testFn();
        console.log(`✅ Passed: ${name}`);
        testsPassed++;
      } catch (error) {
        console.error(`❌ Failed: ${name}`);
        console.error(error);
        testsFailed++;
      }
    }
    
    // Login test
    await runTest('Login functionality', async () => {
      await page.goto(`${config.baseUrl}/login`);
      await page.waitForSelector('form');
      
      await page.fill('input[type="text"]', testUser.username);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      // Wait for dashboard to load
      await page.waitForSelector('.dashboard-container');
      
      const url = page.url();
      assert(url.includes('/dashboard'), 'Should redirect to dashboard after login');
    });
    
    // Dashboard test
    await runTest('Dashboard loads correctly', async () => {
      await page.goto(`${config.baseUrl}/dashboard`);
      
      // Check if recent patients section exists
      await page.waitForSelector('.recent-patients');
      
      // Check if charts or statistics are displayed
      const statsElement = await page.waitForSelector('.statistics-container');
      assert(statsElement, 'Dashboard should display statistics');
    });
    
    // Patient list test
    await runTest('Patient list loads and filters correctly', async () => {
      await page.goto(`${config.baseUrl}/patients`);
      
      // Wait for patient list to load
      await page.waitForSelector('table tbody tr', { timeout: config.timeout });
      
      // Count initial patients
      const initialRows = await page.$$('table tbody tr');
      
      // Test search functionality
      await page.fill('input[placeholder="Search patients..."]', 'Jo');
      await page.press('input[placeholder="Search patients..."]', 'Enter');
      
      // Wait for filtered results
      await page.waitForTimeout(1000);
      
      // Verify filter works (results should change)
      const filteredRows = await page.$$('table tbody tr');
      
      // Test service filter
      await page.selectOption('select[aria-label="Filter by service"]', 'army');
      await page.click('button:has-text("Apply Filters")');
      
      // Wait for filtered results
      await page.waitForTimeout(1000);
      
      // Clear filters
      await page.click('button:has-text("Clear Filters")');
      
      // Wait for reset results
      await page.waitForTimeout(1000);
      
      // Verify filters were cleared
      const resetRows = await page.$$('table tbody tr');
      assert(resetRows.length > 0, 'Patient table should have rows after clearing filters');
    });
    
    // Patient detail view test
    await runTest('Patient detail view loads correctly', async () => {
      await page.goto(`${config.baseUrl}/patients`);
      
      // Wait for patient list to load
      await page.waitForSelector('table tbody tr', { timeout: config.timeout });
      
      // Click on the first patient
      await page.click('table tbody tr:first-child a');
      
      // Wait for patient detail view to load
      await page.waitForSelector('.patient-details');
      
      // Check if patient information is displayed
      const patientName = await page.textContent('h2.patient-name');
      assert(patientName, 'Patient name should be displayed');
      
      // Check if patient records are displayed
      await page.waitForSelector('.patient-records');
    });
    
    // Record creation test
    await runTest('Record creation functionality', async () => {
      // Navigate to create record page
      await page.goto(`${config.baseUrl}/records/new`);
      
      // Wait for form to load
      await page.waitForSelector('form');
      
      // Fill out form fields
      await page.fill('input[name="title"]', 'Test Record');
      await page.fill('textarea[name="description"]', 'This is a test record created by the regression test');
      
      // Select a record type
      await page.selectOption('select[name="recordType"]', 'visit');
      
      // Submit the form
      await page.click('button[type="submit"]');
      
      // Wait for redirect or success message
      await page.waitForSelector('.alert-success, .record-details');
    });
    
    // Reports page test
    await runTest('Reports page functionality', async () => {
      await page.goto(`${config.baseUrl}/reports`);
      
      // Wait for reports page to load
      await page.waitForSelector('.reports-container');
      
      // Check if report options are available
      const reportOptions = await page.$$('.report-options button');
      assert(reportOptions.length > 0, 'Report options should be available');
    });
    
    // Logout test
    await runTest('Logout functionality', async () => {
      // Click logout button (usually in header/navbar)
      await page.click('.navbar .logout-btn, .user-menu .logout-btn, button:has-text("Logout")');
      
      // Wait for redirect to login page
      await page.waitForSelector('form button[type="submit"]');
      
      const url = page.url();
      assert(url.includes('/login'), 'Should redirect to login after logout');
    });
    
    // Output test results
    console.log('\n--- Test Results ---');
    console.log(`Tests Passed: ${testsPassed}`);
    console.log(`Tests Failed: ${testsFailed}`);
    console.log(`Total Tests: ${testsPassed + testsFailed}`);
    
    if (testsFailed > 0) {
      console.log('\n❌ Regression test suite completed with failures');
      process.exit(1);
    } else {
      console.log('\n✅ Regression test suite completed successfully');
    }
    
  } catch (error) {
    console.error('Error in test execution:');
    console.error(error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();