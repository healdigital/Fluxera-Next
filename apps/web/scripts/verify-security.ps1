# Security Verification Script
# Verifies all security fixes are in place by checking migration files

Write-Host "Security Verification Script" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

$Passed = 0
$Failed = 0
$MigrationsPath = "apps/web/supabase/migrations"

if (-not (Test-Path $MigrationsPath)) {
    Write-Host "ERROR: Migrations directory not found" -ForegroundColor Red
    exit 1
}

Write-Host "Checking Migration Files..." -ForegroundColor Yellow
Write-Host ""

# Migration 1: Permissions
$m1 = Get-Content "$MigrationsPath/20251119235959_add_permissions.sql" -Raw -ErrorAction SilentlyContinue
if ($m1) {
    Write-Host "Permissions enum:" -ForegroundColor Cyan
    $perms = @("licenses.view", "licenses.create", "assets.view", "assets.create")
    foreach ($p in $perms) {
        if ($m1 -match [regex]::Escape($p)) {
            Write-Host "  [OK] $p" -ForegroundColor Green
            $Passed++
        } else {
            Write-Host "  [FAIL] $p" -ForegroundColor Red
            $Failed++
        }
    }
} else {
    Write-Host "  [FAIL] Permissions migration not found" -ForegroundColor Red
    $Failed += 4
}
Write-Host ""

# Migration 2: Helper Functions
$m2 = Get-Content "$MigrationsPath/20251120000000_rls_helper_functions.sql" -Raw -ErrorAction SilentlyContinue
if ($m2) {
    Write-Host "Helper functions:" -ForegroundColor Cyan
    if ($m2 -match "has_permission_by_name") {
        Write-Host "  [OK] has_permission_by_name" -ForegroundColor Green
        $Passed++
    } else {
        Write-Host "  [FAIL] has_permission_by_name" -ForegroundColor Red
        $Failed++
    }
} else {
    Write-Host "  [FAIL] Helper functions migration not found" -ForegroundColor Red
    $Failed++
}
Write-Host ""

# Migration 3: RLS Policies
$m3 = Get-Content "$MigrationsPath/20251120000001_enhance_rls_policies.sql" -Raw -ErrorAction SilentlyContinue
if ($m3) {
    Write-Host "RLS policies:" -ForegroundColor Cyan
    $tables = @("software_licenses", "assets")
    foreach ($t in $tables) {
        if (($m3 -match "on public\.$t") -and ($m3 -match "has_permission")) {
            Write-Host "  [OK] $t uses permission checks" -ForegroundColor Green
            $Passed++
        } else {
            Write-Host "  [FAIL] $t missing permission checks" -ForegroundColor Red
            $Failed++
        }
    }
} else {
    Write-Host "  [FAIL] RLS policies migration not found" -ForegroundColor Red
    $Failed += 2
}
Write-Host ""

# Migration 4: Documentation
$m4 = Get-Content "$MigrationsPath/20251120000002_add_function_documentation.sql" -Raw -ErrorAction SilentlyContinue
if ($m4) {
    Write-Host "Function documentation:" -ForegroundColor Cyan
    if ($m4 -match "comment on function") {
        Write-Host "  [OK] Functions documented" -ForegroundColor Green
        $Passed++
    } else {
        Write-Host "  [FAIL] Functions not documented" -ForegroundColor Red
        $Failed++
    }
} else {
    Write-Host "  [FAIL] Documentation migration not found" -ForegroundColor Red
    $Failed++
}
Write-Host ""

# Migration 5: Constraints
$m5 = Get-Content "$MigrationsPath/20251120000003_add_validation_constraints.sql" -Raw -ErrorAction SilentlyContinue
if ($m5) {
    Write-Host "Validation constraints:" -ForegroundColor Cyan
    $constraints = @("check_name_not_empty", "check_cost_non_negative")
    foreach ($c in $constraints) {
        if ($m5 -match $c) {
            Write-Host "  [OK] $c" -ForegroundColor Green
            $Passed++
        } else {
            Write-Host "  [FAIL] $c" -ForegroundColor Red
            $Failed++
        }
    }
} else {
    Write-Host "  [FAIL] Constraints migration not found" -ForegroundColor Red
    $Failed += 2
}
Write-Host ""

# Check original migrations have SECURITY clauses
$licenses = Get-Content "$MigrationsPath/20251117000006_software_licenses.sql" -Raw -ErrorAction SilentlyContinue
if ($licenses -and ($licenses -match "security definer")) {
    Write-Host "[OK] License functions have SECURITY clauses" -ForegroundColor Green
    $Passed++
} else {
    Write-Host "[FAIL] License functions missing SECURITY clauses" -ForegroundColor Red
    $Failed++
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Passed: $Passed" -ForegroundColor Green
Write-Host "Failed: $Failed" -ForegroundColor Red
Write-Host ""

if ($Failed -eq 0) {
    Write-Host "SUCCESS: All checks passed" -ForegroundColor Green
    exit 0
} else {
    Write-Host "FAILURE: Some checks failed" -ForegroundColor Red
    exit 1
}
