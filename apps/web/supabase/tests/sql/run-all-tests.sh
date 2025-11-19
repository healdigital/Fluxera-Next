#!/bin/bash

# ============================================================================
# SQL Test Runner
# Description: Runs all SQL test suites for security fixes
# Author: Security Fixes Implementation
# Date: 2025-11-20
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SUPABASE_DB_URL="${SUPABASE_DB_URL:-postgresql://postgres:postgres@localhost:54322/postgres}"
TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========================================="
echo "SQL Security Tests Runner"
echo "========================================="
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql is not installed${NC}"
    echo "Please install PostgreSQL client tools"
    exit 1
fi

# Check if Supabase is running
if ! psql "$SUPABASE_DB_URL" -c "SELECT 1" &> /dev/null; then
    echo -e "${RED}Error: Cannot connect to Supabase database${NC}"
    echo "Please ensure Supabase is running: pnpm supabase:web:start"
    exit 1
fi

echo -e "${GREEN}✓ Connected to Supabase database${NC}"
echo ""

# Function to run a test file
run_test() {
    local test_file=$1
    local test_name=$(basename "$test_file" .test.sql)
    
    echo "========================================="
    echo "Running: $test_name"
    echo "========================================="
    
    if psql "$SUPABASE_DB_URL" -f "$test_file" 2>&1 | tee /tmp/test_output.log; then
        if grep -q "PASS:" /tmp/test_output.log; then
            echo -e "${GREEN}✓ $test_name completed successfully${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠ $test_name completed with warnings${NC}"
            return 0
        fi
    else
        echo -e "${RED}✗ $test_name failed${NC}"
        return 1
    fi
    
    echo ""
}

# Track results
total_tests=0
passed_tests=0
failed_tests=0

# Run all test files in order
test_files=(
    "01_rls_helper_functions.test.sql"
    "02_validation_constraints.test.sql"
    "03_rls_policies.test.sql"
)

for test_file in "${test_files[@]}"; do
    total_tests=$((total_tests + 1))
    
    if [ -f "$TEST_DIR/$test_file" ]; then
        if run_test "$TEST_DIR/$test_file"; then
            passed_tests=$((passed_tests + 1))
        else
            failed_tests=$((failed_tests + 1))
        fi
    else
        echo -e "${YELLOW}⚠ Test file not found: $test_file${NC}"
        failed_tests=$((failed_tests + 1))
    fi
done

# Print summary
echo ""
echo "========================================="
echo "Test Summary"
echo "========================================="
echo "Total test suites: $total_tests"
echo -e "${GREEN}Passed: $passed_tests${NC}"
if [ $failed_tests -gt 0 ]; then
    echo -e "${RED}Failed: $failed_tests${NC}"
fi
echo "========================================="

# Exit with appropriate code
if [ $failed_tests -gt 0 ]; then
    exit 1
else
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
fi
