# Security Verification Script (PowerShell - Simplified)
# 
# This script verifies that all security fixes have been properly implemented
# by checking the migration files directly
#
# Usage: powershell -ExecutionPolicy Bypass -File apps/web/scripts/verify-security-fixes-simple.ps1

Write-Host "Security Verification Script" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

$Passed = 0
$Failed = 0
$MigrationsPath = "apps/web/supabase/migrations"

# Check if migrations directory exists
if (-not (Test-Path $MigrationsPath)) {
    Write-Host "ERROR: Migrations directory not found: $MigrationsPath" -ForegroundColor Red
    exit 1
}

Write-Host "Verifying Migration Files..." -ForegroundColor Yellow
Write-Host ""

# Check Migration 1: Add Permissions
$migration1 = Get-Content "$MigrationsPath/20251119235959_add_permissions.sql" -Raw -ErrorAction SilentlyContinue
if ($migration1) {
    Write-Host "Checking permissions enum migration:" -ForegroundColor Cyan
    
    $requiredPerms = @(
        "licenses.view", "licenses.create", "licenses.update", "licenses.delete", "licenses.manage",
        "assets.view", "assets.create", "assets.update", "assets.delete", "assets.manage"
    )
    
    foreach ($perm in $requiredPerms) {
        if ($migration1 -match [regex]::Escape($perm)) {
            Write-Host "  ✓ $perm" -ForegroundColor Green
            $Passed++
        } else {
            Write-Host "  ✗ $perm - Missing" -ForegroundColor Red
            $Failed++
        }
    }
} else {
    Write-Host "  ✗ Migration 20251119235959_add_permissions.sql not found" -ForegroundColor Red
    $Failed += 10
}
Write-Host ""

# Check Migration 2: RLS Helper Functions
$migration2 = Get-Content "$MigrationsPath/20251120000000_rls_helper_functions.sql" -Raw -ErrorAction SilentlyContinue
if ($migration2) {
    Write-Host "Checking RLS helper functions migration:" -ForegroundColor Cyan
    
    if ($migration2 -match "has_permission_by_name") {
        Write-Host "  ✓ has_permission_by_name function created" -ForegroundColor Green
        $Passed++
    } else {
        Write-Host "  ✗ has_permission_by_name function missing" -ForegroundColor Red
        $Failed++
    }
    
    if ($migration2 -match "current_user_has_permission") {
        Write-Host "  ✓ current_user_has_permission function created" -ForegroundColor Green
        $Passed++
    } else {
        Write-Host "  ✗ current_user_has_permission function missing" -ForegroundColor Red
        $Failed++
    }
} else {
    Write-Host "  ✗ Migration 20251120000000_rls_helper_functions.sql not found" -ForegroundColor Red
    $Failed += 2
}
Write-Host ""

# Check Migration 3: Enhanced RLS Policies
$migration3 = Get-Content "$MigrationsPath/20251120000001_enhance_rls_policies.sql" -Raw -ErrorAction SilentlyContinue
if ($migration3) {
    Write-Host "Checking enhanced RLS policies migration:" -ForegroundColor Cyan
    
    $tables = @("software_licenses", "assets", "license_assignments", "license_renewal_alerts", "asset_history")
    
    foreach ($table in $tables) {
        if ($migration3 -match "on public\.$table") {
            if ($migration3 -match "has_permission") {
                Write-Host "  ✓ $table policies use permission checks" -ForegroundColor Green
                $Passed++
            } else {
                Write-Host "  ✗ $table policies missing permission checks" -ForegroundColor Red
                $Failed++
            }
        }
    }
} else {
    Write-Host "  ✗ Migration 20251120000001_enhance_rls_policies.sql not found" -ForegroundColor Red
    $Failed += 5
}
Write-Host ""

# Check Migration 4: Function Documentation
$migration4 = Get-Content "$MigrationsPath/20251120000002_add_function_documentation.sql" -Raw -ErrorAction SilentlyContinue
if ($migration4) {
    Write-Host "Checking function documentation migration:" -ForegroundColor Cyan
    
    $functions = @(
        "check_license_expirations",
        "get_license_stats",
        "get_licenses_with_assignments",
        "create_asset_history_entry"
    )
    
    foreach ($func in $functions) {
        if ($migration4 -match "comment on function.*$func") {
            Write-Host "  ✓ $func has documentation" -ForegroundColor Green
            $Passed++
        } else {
            Write-Host "  ✗ $func missing documentation" -ForegroundColor Red
            $Failed++
        }
    }
} else {
    Write-Host "  ✗ Migration 20251120000002_add_function_documentation.sql not found" -ForegroundColor Red
    $Failed += 4
}
Write-Host ""

# Check Migration 5: Validation Constraints
$migration5 = Get-Content "$MigrationsPath/20251120000003_add_validation_constraints.sql" -Raw -ErrorAction SilentlyContinue
if ($migration5) {
    Write-Host "Checking validation constraints migration:" -ForegroundColor Cyan
    
    $constraints = @(
        "check_display_name_not_empty",
        "check_name_not_empty",
        "check_vendor_not_empty",
        "check_cost_non_negative",
        "check_asset_name_not_empty",
        "check_purchase_date_not_future",
        "check_warranty_after_purchase"
    )
    
    foreach ($constraint in $constraints) {
        if ($migration5 -match $constraint) {
            Write-Host "  ✓ $constraint" -ForegroundColor Green
            $Passed++
        } else {
            Write-Host "  ✗ $constraint - Missing" -ForegroundColor Red
            $Failed++
        }
    }
} else {
    Write-Host "  ✗ Migration 20251120000003_add_validation_constraints.sql not found" -ForegroundColor Red
    $Failed += 7
}
Write-Host ""

# Check that functions have SECURITY clauses
Write-Host "Verifying Function Security Clauses..." -ForegroundColor Yellow
Write-Host ""

$licenseMigration = Get-Content "$MigrationsPath/20251117000006_software_licenses.sql" -Raw -ErrorAction SilentlyContinue
$assetMigration = Get-Content "$MigrationsPath/20251117000000_asset_management.sql" -Raw -ErrorAction SilentlyContinue

if ($licenseMigration) {
    Write-Host "Checking license functions have SECURITY clauses:" -ForegroundColor Cyan
    
    if ($licenseMigration -match "check_license_expirations.*security definer") {
        Write-Host "  ✓ check_license_expirations has SECURITY DEFINER" -ForegroundColor Green
        $Passed++
    } else {
        Write-Host "  ✗ check_license_expirations missing SECURITY DEFINER" -ForegroundColor Red
        $Failed++
    }
    
    if ($licenseMigration -match "get_license_stats.*security definer") {
        Write-Host "  ✓ get_license_stats has SECURITY DEFINER" -ForegroundColor Green
        $Passed++
    } else {
        Write-Host "  ✗ get_license_stats missing SECURITY DEFINER" -ForegroundColor Red
        $Failed++
    }
}

if ($assetMigration) {
    if ($assetMigration -match "create_asset_history_entry.*security definer") {
        Write-Host "  ✓ create_asset_history_entry has SECURITY DEFINER" -ForegroundColor Green
        $Passed++
    } else {
        Write-Host "  ✗ create_asset_history_entry missing SECURITY DEFINER" -ForegroundColor Red
        $Failed++
    }
}
Write-Host ""

# Print summary
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "SECURITY VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Passed: " -NoNewline
Write-Host "$Passed" -ForegroundColor Green
Write-Host "Failed: " -NoNewline
Write-Host "$Failed" -ForegroundColor Red
Write-Host ""

if ($Failed -eq 0) {
    Write-Host "SUCCESS: ALL SECURITY CHECKS PASSED" -ForegroundColor Green
    Write-Host "================================================================================" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "FAILURE: SOME SECURITY CHECKS FAILED" -ForegroundColor Red
    Write-Host "================================================================================" -ForegroundColor Cyan
    exit 1
}
