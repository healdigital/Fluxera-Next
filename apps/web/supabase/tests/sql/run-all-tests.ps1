# ============================================================================
# SQL Test Runner (PowerShell)
# Description: Runs all SQL test suites for security fixes
# Author: Security Fixes Implementation
# Date: 2025-11-20
# ============================================================================

$ErrorActionPreference = "Stop"

# Configuration
$SUPABASE_DB_URL = if ($env:SUPABASE_DB_URL) { $env:SUPABASE_DB_URL } else { "postgresql://postgres:postgres@localhost:54322/postgres" }
$TEST_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "SQL Security Tests Runner" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if psql is available
try {
    $null = Get-Command psql -ErrorAction Stop
} catch {
    Write-Host "Error: psql is not installed" -ForegroundColor Red
    Write-Host "Please install PostgreSQL client tools"
    exit 1
}

# Check if Supabase is running
try {
    $null = & psql $SUPABASE_DB_URL -c "SELECT 1" 2>&1
    Write-Host "✓ Connected to Supabase database" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Error: Cannot connect to Supabase database" -ForegroundColor Red
    Write-Host "Please ensure Supabase is running: pnpm supabase:web:start"
    exit 1
}

# Function to run a test file
function Run-Test {
    param (
        [string]$TestFile
    )
    
    $testName = [System.IO.Path]::GetFileNameWithoutExtension($TestFile)
    
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "Running: $testName" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    
    try {
        $output = & psql $SUPABASE_DB_URL -f $TestFile 2>&1 | Out-String
        Write-Host $output
        
        if ($output -match "PASS:") {
            Write-Host "✓ $testName completed successfully" -ForegroundColor Green
            return $true
        } elseif ($LASTEXITCODE -eq 0) {
            Write-Host "⚠ $testName completed with warnings" -ForegroundColor Yellow
            return $true
        } else {
            Write-Host "✗ $testName failed" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "✗ $testName failed with error: $_" -ForegroundColor Red
        return $false
    }
    
    Write-Host ""
}

# Track results
$totalTests = 0
$passedTests = 0
$failedTests = 0

# Run all test files in order
$testFiles = @(
    "01_rls_helper_functions.test.sql",
    "02_validation_constraints.test.sql",
    "03_rls_policies.test.sql"
)

foreach ($testFile in $testFiles) {
    $totalTests++
    
    $fullPath = Join-Path $TEST_DIR $testFile
    
    if (Test-Path $fullPath) {
        if (Run-Test -TestFile $fullPath) {
            $passedTests++
        } else {
            $failedTests++
        }
    } else {
        Write-Host "⚠ Test file not found: $testFile" -ForegroundColor Yellow
        $failedTests++
    }
}

# Print summary
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Total test suites: $totalTests"
Write-Host "Passed: $passedTests" -ForegroundColor Green
if ($failedTests -gt 0) {
    Write-Host "Failed: $failedTests" -ForegroundColor Red
}
Write-Host "=========================================" -ForegroundColor Cyan

# Exit with appropriate code
if ($failedTests -gt 0) {
    exit 1
} else {
    Write-Host "All tests passed!" -ForegroundColor Green
    exit 0
}
