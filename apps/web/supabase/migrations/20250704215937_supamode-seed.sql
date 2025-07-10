-- Creating system settings


INSERT INTO supamode.configuration (key, value)
VALUES ('requires_mfa', 'false');

-- Creating permissions


INSERT INTO supamode.permissions (name, description, permission_type, system_resource, action, metadata)
VALUES (
  'Manage System Settings',
  'Full control over system configuration and settings',
  'system',
  'system_setting',
  '*',
  '{}'::jsonb
);


INSERT INTO supamode.permissions (name, description, permission_type, system_resource, action, metadata)
VALUES (
  'Manage All Accounts',
  'Complete account management - create, read, update, delete',
  'system',
  'account',
  '*',
  '{}'::jsonb
);


INSERT INTO supamode.permissions (name, description, permission_type, system_resource, action, metadata)
VALUES (
  'Manage All Roles',
  'Complete role management and hierarchy configuration',
  'system',
  'role',
  '*',
  '{}'::jsonb
);


INSERT INTO supamode.permissions (name, description, permission_type, system_resource, action, metadata)
VALUES (
  'Manage All Permissions',
  'Complete permission system administration',
  'system',
  'permission',
  '*',
  '{}'::jsonb
);


INSERT INTO supamode.permissions (name, description, permission_type, system_resource, action, metadata)
VALUES (
  'Manage Table Metadata',
  'Full control over table configurations and metadata',
  'system',
  'table',
  '*',
  '{}'::jsonb
);


INSERT INTO supamode.permissions (name, description, permission_type, system_resource, action, metadata)
VALUES (
  'Access Audit Logs',
  'Full access to system audit logs and activity tracking',
  'system',
  'log',
  'select',
  '{}'::jsonb
);


INSERT INTO supamode.permissions (name, description, permission_type, scope, schema_name, table_name, column_name, action, constraints, conditions, metadata)
VALUES (
  'Read Data Auth Users',
  'Read access to all auth users in the system',
  'data',
  'table',
  'auth',
  'users',
  NULL,
  'select',
  NULL,
  NULL,
  '{}'::jsonb
);


INSERT INTO supamode.permissions (name, description, permission_type, scope, schema_name, table_name, column_name, action, constraints, conditions, metadata)
VALUES (
  'Manage All Public Tables',
  'Complete CRUD access to all tables in public schema',
  'data',
  'table',
  'public',
  '*',
  NULL,
  '*',
  NULL,
  NULL,
  '{}'::jsonb
);


INSERT INTO supamode.permissions (name, description, permission_type, scope, schema_name, table_name, column_name, action, constraints, conditions, metadata)
VALUES (
  'Manage All Auth Tables',
  'Complete CRUD access to all tables in auth schema',
  'data',
  'table',
  'auth',
  '*',
  NULL,
  '*',
  NULL,
  NULL,
  '{}'::jsonb
);


INSERT INTO supamode.permissions (name, description, permission_type, scope, schema_name, table_name, column_name, action, constraints, conditions, metadata)
VALUES (
  'Manage All Storage Tables',
  'Complete CRUD access to all tables in storage schema',
  'data',
  'table',
  'storage',
  '*',
  NULL,
  '*',
  NULL,
  NULL,
  '{}'::jsonb
);


INSERT INTO supamode.permissions (name, description, permission_type, scope, schema_name, table_name, column_name, action, constraints, conditions, metadata)
VALUES (
  'Manage All Storage',
  'Complete storage management across all buckets and paths',
  'data',
  'storage',
  NULL,
  NULL,
  NULL,
  '*',
  NULL,
  NULL,
  '{"bucket_name":"*","path_pattern":"*"}'::jsonb
);

-- Creating permission groups


INSERT INTO supamode.permission_groups (name, description, metadata)
VALUES (
  'Solopreneur Complete Access',
  'Comprehensive permissions for solo business owners - full system control',
  '{}'::jsonb
);

-- Creating roles


INSERT INTO supamode.roles (name, description, rank, metadata, valid_from, valid_until)
VALUES (
  'Solopreneur',
  'Complete system access for business owners working independently',
  100,
  '{}'::jsonb,
  NULL,
  NULL
);

-- Creating accounts
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES ('b587cd4c-72e3-4327-90c3-839174a6ec0b', 'test@supamode.com', NOW(), NOW(), NOW());

INSERT INTO supamode.accounts (auth_user_id, metadata)
VALUES ('b587cd4c-72e3-4327-90c3-839174a6ec0b', '{}'::jsonb);

-- Assigning permissions to permission groups


INSERT INTO supamode.permission_group_permissions (group_id, permission_id, added_at)
VALUES ((SELECT id FROM supamode.permission_groups WHERE name = 'Solopreneur Complete Access'), (SELECT id FROM supamode.permissions WHERE name = 'Manage System Settings'), NOW());


INSERT INTO supamode.permission_group_permissions (group_id, permission_id, added_at)
VALUES ((SELECT id FROM supamode.permission_groups WHERE name = 'Solopreneur Complete Access'), (SELECT id FROM supamode.permissions WHERE name = 'Manage All Accounts'), NOW());


INSERT INTO supamode.permission_group_permissions (group_id, permission_id, added_at)
VALUES ((SELECT id FROM supamode.permission_groups WHERE name = 'Solopreneur Complete Access'), (SELECT id FROM supamode.permissions WHERE name = 'Manage All Roles'), NOW());


INSERT INTO supamode.permission_group_permissions (group_id, permission_id, added_at)
VALUES ((SELECT id FROM supamode.permission_groups WHERE name = 'Solopreneur Complete Access'), (SELECT id FROM supamode.permissions WHERE name = 'Manage All Permissions'), NOW());


INSERT INTO supamode.permission_group_permissions (group_id, permission_id, added_at)
VALUES ((SELECT id FROM supamode.permission_groups WHERE name = 'Solopreneur Complete Access'), (SELECT id FROM supamode.permissions WHERE name = 'Manage Table Metadata'), NOW());


INSERT INTO supamode.permission_group_permissions (group_id, permission_id, added_at)
VALUES ((SELECT id FROM supamode.permission_groups WHERE name = 'Solopreneur Complete Access'), (SELECT id FROM supamode.permissions WHERE name = 'Access Audit Logs'), NOW());


INSERT INTO supamode.permission_group_permissions (group_id, permission_id, added_at)
VALUES ((SELECT id FROM supamode.permission_groups WHERE name = 'Solopreneur Complete Access'), (SELECT id FROM supamode.permissions WHERE name = 'Read Data Auth Users'), NOW());


INSERT INTO supamode.permission_group_permissions (group_id, permission_id, added_at)
VALUES ((SELECT id FROM supamode.permission_groups WHERE name = 'Solopreneur Complete Access'), (SELECT id FROM supamode.permissions WHERE name = 'Manage All Public Tables'), NOW());


INSERT INTO supamode.permission_group_permissions (group_id, permission_id, added_at)
VALUES ((SELECT id FROM supamode.permission_groups WHERE name = 'Solopreneur Complete Access'), (SELECT id FROM supamode.permissions WHERE name = 'Manage All Auth Tables'), NOW());


INSERT INTO supamode.permission_group_permissions (group_id, permission_id, added_at)
VALUES ((SELECT id FROM supamode.permission_groups WHERE name = 'Solopreneur Complete Access'), (SELECT id FROM supamode.permissions WHERE name = 'Manage All Storage Tables'), NOW());


INSERT INTO supamode.permission_group_permissions (group_id, permission_id, added_at)
VALUES ((SELECT id FROM supamode.permission_groups WHERE name = 'Solopreneur Complete Access'), (SELECT id FROM supamode.permissions WHERE name = 'Manage All Storage'), NOW());

-- Assigning permissions to roles

-- Assigning permission groups to roles


INSERT INTO supamode.role_permission_groups (role_id, group_id, assigned_at)
VALUES ((SELECT id FROM supamode.roles WHERE name = 'Solopreneur'), (SELECT id FROM supamode.permission_groups WHERE name = 'Solopreneur Complete Access'), NOW());

-- Assigning roles to accounts


INSERT INTO supamode.account_roles (account_id, role_id, assigned_at)
VALUES ((SELECT id FROM supamode.accounts WHERE auth_user_id = 'b587cd4c-72e3-4327-90c3-839174a6ec0b'), (SELECT id FROM supamode.roles WHERE name = 'Solopreneur'), NOW());

-- Creating account permission overrides