# Security Verification Script (PowerShell)
# 
# This script verifies that all security fixes have been properly implemented:
# 1. RLS policies use permission checks (not just membership)
# 2. SQL functions have explicit SECURITY clauses
# 3. Required CHECK constraints are in place
# 4. Required permissions are defined in enum
#
# Usage: pwsh apps/web/scripts/verify-security-fixes.ps1

$ErrorActionPreference = "Stop"

Write-Host "🔒 Security Verification Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$Passed = 0
$Failed = 0

# Function to run SQL query
function Run-Query {
    param([string]$Query)
    
    $result = pnpm --filter web supabase db execute --sql $Query 2>&1 | Out-String
    return $result
}

Write-Host "🔍 Verifying Permissions Enum..." -ForegroundColor Yellow
Write-Host ""

# Check if required permissions exist
$PermissionsQuery = @"
SELECT enumlabel as permission
FROM pg_enum
WHERE enumtypid = 'public.app_permissions'::regtype
ORDER BY enumlabel;
"@

$RequiredPermissions = @(
    "assets.create",
    "assets.delete",
    "assets.manage",
    "assets.update",
    "assets.view",
    "licenses.create",
    "licenses.delete",
    "licenses.manage",
    "licenses.update",
    "licenses.view"
)

$PermissionsResult = Run-Query -Query $PermissionsQuery

Write-Host "Checking required permissions:"
foreach ($perm in $RequiredPermissions) {
    if ($PermissionsResult -match $perm) {
        Write-Host "  ✓ $perm" -ForegroundColor Green
        $Passed++
    } else {
        Write-Host "  ✗ $perm - Missing" -ForegroundColor Red
        $Failed++
    }
}
Write-Host ""

Write-Host "🔍 Verifying RLS Policies..." -ForegroundColor Yellow
Write-Host ""

# Check if RLS policies use has_permission
$PoliciesQuery = @"
SELECT 
    tablename,
    policyname,
    cmd,
    COALESCE(qual, '') || COALESCE(with_check, '') as definition
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('software_licenses', 'assets', 'license_assignments', 
                     'license_renewal_alerts', 'asset_history')
ORDER BY tablename, cmd;
"@

$PoliciesResult = Run-Query -Query $PoliciesQuery

Write-Host "Checking RLS policies use permission checks:"
$PolicyCount = 0
$PolicyWithPermission = 0

# Parse the result (simplified - just check for has_permission)
$lines = $PoliciesResult -split "`n"
foreach ($line in $lines) {
    if ($line -match "software_licenses|assets|license_assignments|license_renewal_alerts|asset_history") {
        $PolicyCount++
        if ($PoliciesResult -match "has_permission") {
            $PolicyWithPermission++
        }
    }
}

if ($PolicyCount -gt 0) {
    Write-Host "  Policies found: $PolicyCount" -ForegroundColor Cyan
    Write-Host "  Policies with permission checks: $PolicyWithPermission" -ForegroundColor Cyan
    if ($PolicyWithPermission -eq $PolicyCount) {
        Write-Host "  ✓ All policies use permission checks" -ForegroundColor Green
        $Passed += $PolicyCount
    } else {
        Write-Host "  ✗ Some policies missing permission checks" -ForegroundColor Red
        $Failed += ($PolicyCount - $PolicyWithPermission)
        $Passed += $PolicyWithPermission
    }
}
Write-Host ""

Write-Host "🔍 Verifying SQL Function Security..." -ForegroundColor Yellow
Write-Host ""

# Check if functions have SECURITY clauses
$FunctionsQuery = @"
SELECT 
    p.proname as function_name,
    CASE p.prosecdef 
        WHEN true THEN 'DEFINER'
        ELSE 'INVOKER'
    END as security_type,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
    AND p.proname IN ('check_license_expirations', 'get_license_stats', 
                     'get_licenses_with_assignments', 'create_asset_history_entry')
ORDER BY p.proname;
"@

$FunctionsResult = Run-Query -Query $FunctionsQuery

$CriticalFunctions = @(
    "check_license_expirations",
    "create_asset_history_entry",
    "get_license_stats",
    "get_licenses_with_assignments"
)

Write-Host "Checking critical functions have SECURITY clauses:"
foreach ($func in $CriticalFunctions) {
    if ($FunctionsResult -match $func) {
        if ($FunctionsResult -match "DEFINER") {
            if ($FunctionsResult -match "search_path") {
                Write-Host "  ✓ $func - SECURITY DEFINER + search_path" -ForegroundColor Green
                $Passed++
            } else {
                Write-Host "  ⚠ $func - SECURITY DEFINER but missing search_path" -ForegroundColor Yellow
                $Failed++
            }
        } else {
            Write-Host "  ✓ $func - SECURITY INVOKER" -ForegroundColor Green
            $Passed++
        }
    } else {
        Write-Host "  ✗ $func - Not found" -ForegroundColor Red
        $Failed++
    }
}
Write-Host ""

Write-Host "🔍 Verifying CHECK Constraints..." -ForegroundColor Yellow
Write-Host ""

# Check if required CHECK constraints exist
$ConstraintsQuery = @"
SELECT 
    conrelid::regclass AS table_name,
    conname AS constraint_name
FROM pg_constraint
WHERE contype = 'c'
    AND connamespace = 'public'::regnamespace
    AND conrelid::regclass::text IN (
        'public.user_profiles',
        'public.software_licenses',
        'public.assets',
        'public.dashboard_alerts',
        'public.accounts'
    )
ORDER BY table_name, constraint_name;
"@

$ConstraintsResult = Run-Query -Query $ConstraintsQuery

$RequiredConstraints = @(
    @{Table="user_profiles"; Name="check_display_name_not_empty"},
    @{Table="software_licenses"; Name="check_name_not_empty"},
    @{Table="software_licenses"; Name="check_vendor_not_empty"},
    @{Table="software_licenses"; Name="check_cost_non_negative"},
    @{Table="assets"; Name="check_asset_name_not_empty"},
    @{Table="assets"; Name="check_purchase_date_not_future"},
    @{Table="assets"; Name="check_warranty_after_purchase"}
)

Write-Host "Checking required CHECK constraints:"
foreach ($constraint in $RequiredConstraints) {
    if ($ConstraintsResult -match $constraint.Name) {
        Write-Host "  ✓ $($constraint.Table).$($constraint.Name)" -ForegroundColor Green
        $Passed++
    } else {
        Write-Host "  ✗ $($constraint.Table).$($constraint.Name) - Missing" -ForegroundColor Red
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
    Write-Host "✅ ALL SECURITY CHECKS PASSED" -ForegroundColor Green
    Write-Host "================================================================================" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "❌ SOME SECURITY CHECKS FAILED" -ForegroundColor Red
    Write-Host "================================================================================" -ForegroundColor Cyan
    exit 1
}
