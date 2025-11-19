# Requirements Document - Security & Quality Fixes

## Introduction

This specification addresses all critical security, performance, and quality issues identified in the comprehensive code audit of the Fluxera platform. The audit revealed a score of 7.5/10 with several critical security vulnerabilities in RLS policies, missing security clauses in SQL functions, and insufficient data validation constraints.

## Glossary

- **RLS (Row Level Security)**: PostgreSQL security feature that restricts row access based on user policies
- **Policy**: RLS rule that defines who can access which rows in a table
- **SECURITY DEFINER**: SQL function clause that executes with privileges of the function owner
- **SECURITY INVOKER**: SQL function clause that executes with privileges of the calling user
- **CHECK Constraint**: Database constraint that validates data before insertion/update
- **Server Action**: Next.js server-side function that handles mutations
- **Loader**: Server-side function that fetches data for page rendering

## Requirements

### Requirement 1: Secure RLS Policies

**User Story:** As a security administrator, I want all RLS policies to properly verify user roles and permissions, so that users can only access data they are authorized to see.

#### Acceptance Criteria

1. WHEN a user attempts to insert a license renewal alert, THE System SHALL verify the user has 'owner' role or 'licenses.manage' permission for the account
2. WHEN a user attempts to create a software license, THE System SHALL verify the user has 'licenses.create' permission for the account
3. WHEN a user attempts to update a software license, THE System SHALL verify the user has 'licenses.update' permission for the account
4. WHEN a user attempts to delete a software license, THE System SHALL verify the user has 'licenses.delete' permission for the account
5. WHEN a user attempts to update another user's profile, THE System SHALL verify the user has 'members.manage' permission for the shared account

### Requirement 2: SQL Function Security Clauses

**User Story:** As a database administrator, I want all SQL functions to have explicit SECURITY clauses, so that privilege escalation is controlled and predictable.

#### Acceptance Criteria

1. WHEN a system function needs elevated privileges to create alerts, THE Function SHALL use SECURITY DEFINER clause
2. WHEN a function reads data using RLS policies, THE Function SHALL use SECURITY INVOKER clause
3. WHEN a function uses SECURITY DEFINER, THE Function SHALL set search_path to prevent SQL injection
4. WHEN an admin function is called, THE Function SHALL verify the user has super_admin role before executing
5. THE System SHALL document each function's security model in SQL comments

### Requirement 3: Data Validation Constraints

**User Story:** As a data integrity manager, I want database constraints to validate all critical data, so that invalid data cannot be stored in the system.

#### Acceptance Criteria

1. WHEN an email is stored in user_profiles, THE System SHALL validate it matches RFC 5322 email format
2. WHEN a license expiration date is set, THE System SHALL validate it is not in the past
3. WHEN a license total_seats is set, THE System SHALL validate it is a positive integer
4. WHEN a license assignment is created, THE System SHALL validate it has exactly one target (user OR asset, not both)
5. WHEN an asset purchase_price is set, THE System SHALL validate it is non-negative

### Requirement 4: Optimized RLS Performance

**User Story:** As a performance engineer, I want RLS policies to use optimized queries, so that database performance remains acceptable under load.

#### Acceptance Criteria

1. THE System SHALL provide a user_account_ids() function that returns account IDs for the current user
2. THE System SHALL provide a user_has_permission() function that checks specific permissions
3. WHEN RLS policies check account membership, THE Policies SHALL use the optimized functions instead of subqueries
4. THE System SHALL create indexes on (user_id, account_id) to optimize membership lookups
5. THE System SHALL include role column in membership indexes for permission checks

### Requirement 5: Standardized Error Handling

**User Story:** As a developer, I want consistent error handling across all server actions and loaders, so that errors are predictable and debuggable.

#### Acceptance Criteria

1. THE System SHALL define AppError base class with code and statusCode properties
2. THE System SHALL define NotFoundError for missing resources with 404 status
3. THE System SHALL define UnauthorizedError for permission failures with 401 status
4. WHEN a loader cannot find a resource, THE Loader SHALL throw NotFoundError
5. WHEN a server action lacks permissions, THE Action SHALL throw UnauthorizedError

### Requirement 6: Reusable Permission Helpers

**User Story:** As a developer, I want reusable helper functions for permission checks, so that I don't duplicate permission logic across server actions.

#### Acceptance Criteria

1. THE System SHALL provide withAccountPermission() helper that wraps actions with permission checks
2. WHEN withAccountPermission() is called, THE Helper SHALL verify user membership in the account
3. WHEN withAccountPermission() is called, THE Helper SHALL verify user has the specified permission
4. WHEN permission check fails, THE Helper SHALL throw UnauthorizedError with descriptive message
5. THE Helper SHALL support both role-based and permission-based checks

### Requirement 7: SQL Function Tests

**User Story:** As a QA engineer, I want automated tests for all critical SQL functions, so that database logic is verified before deployment.

#### Acceptance Criteria

1. THE System SHALL provide pgTAP tests for get_license_stats() function
2. THE System SHALL provide pgTAP tests for get_team_members() function
3. THE System SHALL provide pgTAP tests for check_license_expirations() function
4. WHEN tests run, THE Tests SHALL verify correct results for valid inputs
5. WHEN tests run, THE Tests SHALL verify proper error handling for invalid inputs

### Requirement 8: Comprehensive Documentation

**User Story:** As a new developer, I want comprehensive documentation for all SQL functions and server actions, so that I can understand and maintain the codebase.

#### Acceptance Criteria

1. WHEN a SQL function is created, THE Function SHALL have a COMMENT describing its purpose, parameters, return value, and security model
2. WHEN a server action is created, THE Action SHALL have JSDoc with @param, @returns, @throws, and @example tags
3. THE Documentation SHALL explain permission requirements for each action
4. THE Documentation SHALL provide usage examples for complex functions
5. THE Documentation SHALL describe performance characteristics and optimization strategies

### Requirement 9: Environment Variable Validation

**User Story:** As a DevOps engineer, I want environment variables validated at startup, so that configuration errors are caught before deployment.

#### Acceptance Criteria

1. THE System SHALL define a Zod schema for all required environment variables
2. WHEN the application starts in production, THE System SHALL validate environment variables against the schema
3. WHEN validation fails, THE System SHALL log detailed error messages showing which variables are invalid
4. WHEN validation fails, THE System SHALL prevent application startup
5. THE System SHALL provide type-safe access to validated environment variables

### Requirement 10: Security Verification Script

**User Story:** As a security auditor, I want an automated script to verify all security fixes, so that I can confirm the system is properly secured.

#### Acceptance Criteria

1. THE Script SHALL verify all RLS policies use permission checks instead of simple membership checks
2. THE Script SHALL verify all SQL functions have explicit SECURITY clauses
3. THE Script SHALL verify all required CHECK constraints are in place
4. WHEN verification passes, THE Script SHALL exit with code 0 and success message
5. WHEN verification fails, THE Script SHALL exit with code 1 and detailed error messages

---

## Non-Functional Requirements

### Security
- All RLS policies must prevent unauthorized data access
- All SQL functions must have explicit security models
- All sensitive operations must verify permissions

### Performance
- RLS policy checks must complete in <10ms
- Optimized functions must reduce query time by >50%
- Database indexes must support all common query patterns

### Maintainability
- Code duplication must be reduced by >60%
- All critical functions must have automated tests
- All public APIs must have comprehensive documentation

### Reliability
- Error handling must be consistent across all modules
- All errors must provide actionable information
- System must fail safely when permissions are insufficient

---

## Success Criteria

1. **Security Score**: Improve from 6/10 to 9/10
2. **Test Coverage**: Increase from 40% to >70%
3. **Documentation Score**: Improve from 3/10 to 8/10
4. **Performance**: Reduce RLS query time by >50%
5. **Code Quality**: Eliminate all critical security warnings

---

## Dependencies

- PostgreSQL 14+ with RLS support
- Supabase CLI for migrations
- pgTAP for SQL testing
- Next.js 16 with App Router
- TypeScript 5.x

---

## Risks and Mitigation

### Risk 1: Breaking Changes
**Mitigation**: Apply all changes in staging first, run comprehensive tests

### Risk 2: Performance Regression
**Mitigation**: Benchmark before/after, monitor query performance

### Risk 3: Data Migration Issues
**Mitigation**: Create rollback scripts, test on copy of production data

---

**Document Version**: 1.0  
**Last Updated**: November 19, 2025  
**Next Review**: After Phase 1 implementation
