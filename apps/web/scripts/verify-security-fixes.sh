#!/bin/bash
# Security Verification Script
# 
# This script verifies that all security fixes have been properly implemented:
# 1. RLS policies use permission checks (not just membership)
# 2. SQL functions have explicit SECURITY clauses
# 3. Required CHECK constraints are in place
# 4. Required permissions are defined in enum
#
# Usage: bash apps/web/scripts/verify-security-fixes.sh

set -e

echo "🔒 Security Verification Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Function to run SQL query
run_query() {
    pnpm --filter web supabase db execute --sql "$1" 2>&1
}

echo "🔍 Verifying Permissions Enum..."
echo ""

# Check if required permissions exist
PERMISSIONS_QUERY="
SELECT enumlabel as permission
FROM pg_enum
WHERE enumtypid = 'public.app_permissions'::regtype
ORDER BY enumlabel;
"

REQUIRED_PERMISSIONS=(
    "assets.create"
    "assets.delete"
    "assets.manage"
    "assets.update"
    "assets.view"
    "licenses.create"
    "licenses.delete"
    "licenses.manage"
    "licenses.update"
    "licenses.view"
)

PERMISSIONS_RESULT=$(run_query "$PERMISSIONS_QUERY")

echo "Checking required permissions:"
for perm in "${REQUIRED_PERMISSIONS[@]}"; do
    if echo "$PERMISSIONS_RESULT" | grep -q "$perm"; then
        echo -e "  ${GREEN}✓${NC} $perm"
        ((PASSED++))
    else
        echo -e "  ${RED}✗${NC} $perm - Missing"
        ((FAILED++))
    fi
done
echo ""

echo "🔍 Verifying RLS Policies..."
echo ""

# Check if RLS policies use has_permission
POLICIES_QUERY="
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
"

POLICIES_RESULT=$(run_query "$POLICIES_QUERY")

echo "Checking RLS policies use permission checks:"
POLICY_COUNT=0
POLICY_WITH_PERMISSION=0

while IFS='|' read -r table policy cmd definition; do
    if [ -n "$table" ] && [ "$table" != "tablename" ]; then
        ((POLICY_COUNT++))
        if echo "$definition" | grep -q "has_permission"; then
            echo -e "  ${GREEN}✓${NC} $table.$policy ($cmd)"
            ((POLICY_WITH_PERMISSION++))
            ((PASSED++))
        else
            echo -e "  ${RED}✗${NC} $table.$policy ($cmd) - Missing permission check"
            ((FAILED++))
        fi
    fi
done <<< "$POLICIES_RESULT"

echo ""
echo "  Policies with permission checks: $POLICY_WITH_PERMISSION/$POLICY_COUNT"
echo ""

echo "🔍 Verifying SQL Function Security..."
echo ""

# Check if functions have SECURITY clauses
FUNCTIONS_QUERY="
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
"

FUNCTIONS_RESULT=$(run_query "$FUNCTIONS_QUERY")

CRITICAL_FUNCTIONS=(
    "check_license_expirations"
    "create_asset_history_entry"
    "get_license_stats"
    "get_licenses_with_assignments"
)

echo "Checking critical functions have SECURITY clauses:"
for func in "${CRITICAL_FUNCTIONS[@]}"; do
    if echo "$FUNCTIONS_RESULT" | grep -q "$func"; then
        if echo "$FUNCTIONS_RESULT" | grep -A 2 "$func" | grep -q "DEFINER"; then
            if echo "$FUNCTIONS_RESULT" | grep -A 5 "$func" | grep -qi "search_path"; then
                echo -e "  ${GREEN}✓${NC} $func - SECURITY DEFINER + search_path"
                ((PASSED++))
            else
                echo -e "  ${YELLOW}⚠${NC} $func - SECURITY DEFINER but missing search_path"
                ((FAILED++))
            fi
        else
            echo -e "  ${GREEN}✓${NC} $func - SECURITY INVOKER"
            ((PASSED++))
        fi
    else
        echo -e "  ${RED}✗${NC} $func - Not found"
        ((FAILED++))
    fi
done
echo ""

echo "🔍 Verifying CHECK Constraints..."
echo ""

# Check if required CHECK constraints exist
CONSTRAINTS_QUERY="
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
"

CONSTRAINTS_RESULT=$(run_query "$CONSTRAINTS_QUERY")

REQUIRED_CONSTRAINTS=(
    "user_profiles|check_display_name_not_empty"
    "software_licenses|check_name_not_empty"
    "software_licenses|check_vendor_not_empty"
    "software_licenses|check_cost_non_negative"
    "assets|check_asset_name_not_empty"
    "assets|check_purchase_date_not_future"
    "assets|check_warranty_after_purchase"
)

echo "Checking required CHECK constraints:"
for constraint in "${REQUIRED_CONSTRAINTS[@]}"; do
    IFS='|' read -r table name <<< "$constraint"
    if echo "$CONSTRAINTS_RESULT" | grep -q "$name"; then
        echo -e "  ${GREEN}✓${NC} $table.$name"
        ((PASSED++))
    else
        echo -e "  ${RED}✗${NC} $table.$name - Missing"
        ((FAILED++))
    fi
done
echo ""

# Print summary
echo "================================================================================"
echo "SECURITY VERIFICATION SUMMARY"
echo "================================================================================"
echo ""
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL SECURITY CHECKS PASSED${NC}"
    echo "================================================================================"
    exit 0
else
    echo -e "${RED}❌ SOME SECURITY CHECKS FAILED${NC}"
    echo "================================================================================"
    exit 1
fi
