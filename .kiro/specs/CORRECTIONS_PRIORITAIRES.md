# Corrections Prioritaires - Phase 1 (Sécurité Critique)

## 🚨 URGENT: À corriger immédiatement

### 1. Correction des Policies RLS

#### Fichier: `apps/web/supabase/migrations/20251120000000_fix_rls_policies.sql`

```sql
-- ============================================================================
-- CORRECTION DES POLICIES RLS TROP PERMISSIVES
-- ============================================================================

-- 1. LICENSE RENEWAL ALERTS: Restreindre l'insertion aux admins uniquement
-- ============================================================================

drop policy if exists "System can insert license alerts" on public.license_renewal_alerts;

create policy "Admins can insert license alerts"
  on public.license_renewal_alerts for insert
  to authenticated
  with check (
    exists (
      select 1 
      from public.accounts_memberships am
      join public.account_roles ar on am.role = ar.name
      where am.user_id = auth.uid()
        and am.account_id = license_renewal_alerts.account_id
        and (ar.name = 'owner' or ar.permissions ? 'licenses.manage')
    )
  );

-- 2. SOFTWARE LICENSES: Ajouter vérification des permissions
-- ============================================================================

drop policy if exists "Users can create team licenses" on public.software_licenses;
drop policy if exists "Users can update team licenses" on public.software_licenses;
drop policy if exists "Users can delete team licenses" on public.software_licenses;

-- CREATE: Vérifier permission licenses.create
create policy "Users can create team licenses"
  on public.software_licenses for insert
  to authenticated
  with check (
    exists (
      select 1 
      from public.accounts_memberships am
      join public.account_roles ar on am.role = ar.name
      where am.user_id = auth.uid()
        and am.account_id = software_licenses.account_id
        and (ar.name = 'owner' or ar.permissions ? 'licenses.create')
    )
  );

-- UPDATE: Vérifier permission licenses.update
create policy "Users can update team licenses"
  on public.software_licenses for update
  to authenticated
  using (
    exists (
      select 1 
      from public.accounts_memberships am
      join public.account_roles ar on am.role = ar.name
      where am.user_id = auth.uid()
        and am.account_id = software_licenses.account_id
        and (ar.name = 'owner' or ar.permissions ? 'licenses.update')
    )
  )
  with check (
    exists (
      select 1 
      from public.accounts_memberships am
      join public.account_roles ar on am.role = ar.name
      where am.user_id = auth.uid()
        and am.account_id = software_licenses.account_id
        and (ar.name = 'owner' or ar.permissions ? 'licenses.update')
    )
  );

-- DELETE: Vérifier permission licenses.delete
create policy "Users can delete team licenses"
  on public.software_licenses for delete
  to authenticated
  using (
    exists (
      select 1 
      from public.accounts_memberships am
      join public.account_roles ar on am.role = ar.name
      where am.user_id = auth.uid()
        and am.account_id = software_licenses.account_id
        and (ar.name = 'owner' or ar.permissions ? 'licenses.delete')
    )
  );

-- 3. USER PROFILES: Restreindre les mises à jour
-- ============================================================================

drop policy if exists "Admins can update team member profiles" on public.user_profiles;

create policy "Admins can update team member profiles"
  on public.user_profiles for update
  to authenticated
  using (
    exists (
      select 1 
      from public.accounts_memberships am
      join public.account_roles ar on am.role = ar.name
      where am.user_id = auth.uid()
        and exists (
          select 1 
          from public.accounts_memberships target_am
          where target_am.user_id = user_profiles.id
            and target_am.account_id = am.account_id
        )
        and (ar.name = 'owner' or ar.permissions ? 'members.manage')
    )
  );

-- 4. DASHBOARD ALERTS: Restreindre la création
-- ============================================================================

drop policy if exists "System can create alerts" on public.dashboard_alerts;

create policy "Admins can create alerts"
  on public.dashboard_alerts for insert
  to authenticated
  with check (
    exists (
      select 1 
      from public.accounts_memberships am
      join public.account_roles ar on am.role = ar.name
      where am.user_id = auth.uid()
        and am.account_id = dashboard_alerts.account_id
        and (ar.name = 'owner' or ar.permissions ? 'dashboard.manage')
    )
  );

-- 5. ASSETS: Ajouter vérification des permissions
-- ============================================================================

drop policy if exists "Users can create team assets" on public.assets;
drop policy if exists "Users can update team assets" on public.assets;
drop policy if exists "Users can delete team assets" on public.assets;

-- CREATE: Vérifier permission assets.create
create policy "Users can create team assets"
  on public.assets for insert
  to authenticated
  with check (
    exists (
      select 1 
      from public.accounts_memberships am
      join public.account_roles ar on am.role = ar.name
      where am.user_id = auth.uid()
        and am.account_id = assets.account_id
        and (ar.name = 'owner' or ar.permissions ? 'assets.create')
    )
  );

-- UPDATE: Vérifier permission assets.update
create policy "Users can update team assets"
  on public.assets for update
  to authenticated
  using (
    exists (
      select 1 
      from public.accounts_memberships am
      join public.account_roles ar on am.role = ar.name
      where am.user_id = auth.uid()
        and am.account_id = assets.account_id
        and (ar.name = 'owner' or ar.permissions ? 'assets.update')
    )
  )
  with check (
    exists (
      select 1 
      from public.accounts_memberships am
      join public.account_roles ar on am.role = ar.name
      where am.user_id = auth.uid()
        and am.account_id = assets.account_id
        and (ar.name = 'owner' or ar.permissions ? 'assets.update')
    )
  );

-- DELETE: Vérifier permission assets.delete
create policy "Users can delete team assets"
  on public.assets for delete
  to authenticated
  using (
    exists (
      select 1 
      from public.accounts_memberships am
      join public.account_roles ar on am.role = ar.name
      where am.user_id = auth.uid()
        and am.account_id = assets.account_id
        and (ar.name = 'owner' or ar.permissions ? 'assets.delete')
    )
  );

-- ============================================================================
-- OPTIMISATION DES POLICIES RLS
-- ============================================================================

-- Créer une fonction pour obtenir les account_ids de l'utilisateur
-- Cela évite de répéter la subquery dans chaque policy

create or replace function public.user_account_ids()
returns setof uuid
language sql
stable
security invoker
as $$
  select account_id 
  from public.accounts_memberships
  where user_id = auth.uid();
$$;

-- Créer une fonction pour vérifier les permissions
create or replace function public.user_has_permission(
  p_account_id uuid,
  p_permission text
)
returns boolean
language sql
stable
security invoker
as $$
  select exists (
    select 1 
    from public.accounts_memberships am
    join public.account_roles ar on am.role = ar.name
    where am.user_id = auth.uid()
      and am.account_id = p_account_id
      and (ar.name = 'owner' or ar.permissions ? p_permission)
  );
$$;

-- Index pour optimiser les fonctions
create index if not exists idx_accounts_memberships_user_account 
  on public.accounts_memberships(user_id, account_id) 
  include (role);

-- ============================================================================
-- COMMENTAIRES
-- ============================================================================

comment on function public.user_account_ids() is 
'Returns all account IDs that the current user is a member of. 
Used to optimize RLS policies by avoiding repeated subqueries.';

comment on function public.user_has_permission(uuid, text) is 
'Checks if the current user has a specific permission for an account.
Parameters:
- p_account_id: UUID of the account
- p_permission: Permission to check (e.g., "licenses.create")
Returns: true if user has permission, false otherwise';
```

### 2. Ajout des clauses SECURITY aux fonctions

#### Fichier: `apps/web/supabase/migrations/20251120000001_add_security_clauses.sql`

```sql
-- ============================================================================
-- AJOUT DES CLAUSES SECURITY DEFINER/INVOKER AUX FONCTIONS
-- ============================================================================

-- 1. FONCTIONS SYSTÈME (SECURITY DEFINER)
-- Ces fonctions doivent accéder à des données privilégiées
-- ============================================================================

-- check_license_expirations: Doit pouvoir créer des alertes
create or replace function public.check_license_expirations()
returns void
language plpgsql
security definer  -- ✅ Ajout
set search_path = public, pg_temp
as $$
declare
  v_license record;
  v_days_until_expiration int;
begin
  -- Code existant...
  for v_license in
    select id, account_id, name, expiration_date
    from public.software_licenses
    where expiration_date is not null
      and expiration_date >= current_date
      and expiration_date <= current_date + interval '90 days'
  loop
    v_days_until_expiration := v_license.expiration_date - current_date;
    
    -- Créer une alerte si elle n'existe pas déjà
    insert into public.license_renewal_alerts (
      license_id,
      account_id,
      alert_type,
      days_until_expiration,
      created_at
    )
    values (
      v_license.id,
      v_license.account_id,
      case
        when v_days_until_expiration <= 7 then 'critical'
        when v_days_until_expiration <= 30 then 'warning'
        else 'info'
      end,
      v_days_until_expiration,
      now()
    )
    on conflict (license_id, alert_type) do nothing;
  end loop;
end;
$$;

-- refresh_platform_metrics: Doit pouvoir rafraîchir les vues matérialisées
create or replace function public.refresh_platform_metrics()
returns void
language plpgsql
security definer  -- ✅ Ajout
set search_path = public, pg_temp
as $$
begin
  refresh materialized view concurrently public.platform_metrics;
end;
$$;

-- 2. FONCTIONS DE LECTURE (SECURITY INVOKER)
-- Ces fonctions utilisent les permissions de l'utilisateur appelant
-- ============================================================================

-- get_team_members: Utilise RLS pour filtrer les résultats
create or replace function public.get_team_members(
  p_account_slug text,
  p_search text default null,
  p_role text default null,
  p_status text default null,
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  user_id uuid,
  email varchar,
  display_name varchar,
  avatar_url text,
  role varchar,
  status varchar,
  last_sign_in_at timestamp with time zone,
  created_at timestamp with time zone
)
language plpgsql
security invoker  -- ✅ Ajout
stable
as $$
begin
  -- Code existant...
end;
$$;

-- get_license_stats: Utilise RLS pour filtrer les résultats
create or replace function public.get_license_stats(p_account_id uuid)
returns table(
  total_licenses bigint,
  expiring_soon bigint,
  expired bigint,
  total_assignments bigint
)
language plpgsql
security invoker  -- ✅ Ajout
stable
as $$
begin
  -- Code existant...
end;
$$;

-- get_licenses_with_assignments: Utilise RLS pour filtrer les résultats
create or replace function public.get_licenses_with_assignments(p_account_id uuid)
returns table(
  id uuid,
  name varchar,
  vendor varchar,
  license_type varchar,
  license_key text,
  expiration_date date,
  total_seats int,
  assigned_seats bigint,
  available_seats bigint,
  created_at timestamp with time zone
)
language plpgsql
security invoker  -- ✅ Ajout
stable
as $$
begin
  -- Code existant...
end;
$$;

-- 3. FONCTIONS ADMIN (SECURITY DEFINER avec vérification)
-- Ces fonctions nécessitent des privilèges élevés mais vérifient les permissions
-- ============================================================================

-- get_admin_platform_metrics: Vérifie que l'utilisateur est admin
create or replace function public.get_admin_platform_metrics()
returns jsonb
language plpgsql
security definer  -- ✅ Ajout
set search_path = public, pg_temp
as $$
declare
  v_result jsonb;
begin
  -- Vérifier que l'utilisateur est super admin
  if not exists (
    select 1 from auth.users
    where id = auth.uid()
      and raw_app_meta_data->>'is_super_admin' = 'true'
  ) then
    raise exception 'Insufficient permissions';
  end if;
  
  -- Code existant...
  return v_result;
end;
$$;

-- ============================================================================
-- COMMENTAIRES
-- ============================================================================

comment on function public.check_license_expirations() is 
'System function that checks for expiring licenses and creates alerts.
SECURITY DEFINER: Needs elevated privileges to create alerts.
Should be called by cron job only.';

comment on function public.get_team_members(text, text, text, text, int, int) is 
'Returns team members with filtering and pagination.
SECURITY INVOKER: Uses caller permissions and RLS policies.
Results are automatically filtered based on user access.';
```

### 3. Ajout des contraintes de validation

#### Fichier: `apps/web/supabase/migrations/20251120000002_add_validation_constraints.sql`

```sql
-- ============================================================================
-- AJOUT DES CONTRAINTES DE VALIDATION
-- ============================================================================

-- 1. USER PROFILES
-- ============================================================================

-- Validation du format email
alter table public.user_profiles
add constraint check_email_format 
check (
  email is null or 
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
);

-- Validation du display_name (non vide si présent)
alter table public.user_profiles
add constraint check_display_name_not_empty
check (
  display_name is null or 
  length(trim(display_name)) > 0
);

-- 2. SOFTWARE LICENSES
-- ============================================================================

-- Validation de la date d'expiration (ne peut pas être dans le passé lors de la création)
alter table public.software_licenses
add constraint check_expiration_date_valid
check (
  expiration_date is null or 
  expiration_date >= current_date
);

-- Validation du nombre de sièges (doit être positif)
alter table public.software_licenses
add constraint check_total_seats_positive
check (total_seats is null or total_seats > 0);

-- Validation du nom (non vide)
alter table public.software_licenses
add constraint check_name_not_empty
check (length(trim(name)) > 0);

-- Validation du vendor (non vide)
alter table public.software_licenses
add constraint check_vendor_not_empty
check (length(trim(vendor)) > 0);

-- 3. ASSETS
-- ============================================================================

-- Validation du nom (non vide)
alter table public.assets
add constraint check_name_not_empty
check (length(trim(name)) > 0);

-- Validation du serial_number (format alphanumérique si présent)
alter table public.assets
add constraint check_serial_number_format
check (
  serial_number is null or 
  serial_number ~* '^[A-Z0-9-]+$'
);

-- Validation du purchase_price (doit être positif)
alter table public.assets
add constraint check_purchase_price_positive
check (purchase_price is null or purchase_price >= 0);

-- Validation du purchase_date (ne peut pas être dans le futur)
alter table public.assets
add constraint check_purchase_date_not_future
check (purchase_date is null or purchase_date <= current_date);

-- 4. LICENSE ASSIGNMENTS
-- ============================================================================

-- Validation: doit avoir soit assigned_to_user soit assigned_to_asset
alter table public.license_assignments
add constraint check_assignment_target
check (
  (assigned_to_user is not null and assigned_to_asset is null) or
  (assigned_to_user is null and assigned_to_asset is not null)
);

-- 5. DASHBOARD ALERTS
-- ============================================================================

-- Validation de expires_at (doit être dans le futur si présent)
alter table public.dashboard_alerts
add constraint check_expires_at_future
check (
  expires_at is null or 
  expires_at > created_at
);

-- Validation du message (non vide)
alter table public.dashboard_alerts
add constraint check_message_not_empty
check (length(trim(message)) > 0);

-- ============================================================================
-- COMMENTAIRES
-- ============================================================================

comment on constraint check_email_format on public.user_profiles is 
'Ensures email addresses follow a valid format';

comment on constraint check_expiration_date_valid on public.software_licenses is 
'Prevents creating licenses with expiration dates in the past';

comment on constraint check_assignment_target on public.license_assignments is 
'Ensures each assignment has exactly one target (user OR asset, not both)';
```

### 4. Script de vérification

#### Fichier: `apps/web/scripts/verify-security-fixes.ts`

```typescript
#!/usr/bin/env tsx

/**
 * Script de vérification des corrections de sécurité
 * 
 * Vérifie que:
 * 1. Toutes les policies RLS ont été mises à jour
 * 2. Toutes les fonctions ont une clause SECURITY
 * 3. Toutes les contraintes de validation sont en place
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const client = createClient(supabaseUrl, supabaseKey);

async function verifyRLSPolicies() {
  console.log('🔍 Vérification des policies RLS...\n');
  
  const { data: policies, error } = await client
    .from('pg_policies')
    .select('*')
    .in('tablename', [
      'software_licenses',
      'license_assignments',
      'license_renewal_alerts',
      'assets',
      'user_profiles',
      'dashboard_alerts'
    ]);
    
  if (error) {
    console.error('❌ Erreur:', error);
    return false;
  }
  
  // Vérifier qu'il n'y a pas de policies avec "with check (true)"
  const unsafePolicies = policies?.filter(p => 
    p.qual?.includes('true') && !p.qual?.includes('exists')
  );
  
  if (unsafePolicies && unsafePolicies.length > 0) {
    console.error('❌ Policies non sécurisées trouvées:');
    unsafePolicies.forEach(p => {
      console.error(`  - ${p.tablename}.${p.policyname}`);
    });
    return false;
  }
  
  console.log('✅ Toutes les policies RLS sont sécurisées\n');
  return true;
}

async function verifyFunctionSecurity() {
  console.log('🔍 Vérification des clauses SECURITY...\n');
  
  const { data: functions, error } = await client.rpc('pg_get_functiondef', {
    funcid: 'public.check_license_expirations'
  });
  
  if (error) {
    console.error('❌ Erreur:', error);
    return false;
  }
  
  // Vérifier que les fonctions ont une clause SECURITY
  const functionsToCheck = [
    'check_license_expirations',
    'refresh_platform_metrics',
    'get_team_members',
    'get_license_stats'
  ];
  
  for (const funcName of functionsToCheck) {
    const { data } = await client.rpc('pg_get_functiondef', {
      funcid: `public.${funcName}`
    });
    
    if (!data?.includes('SECURITY')) {
      console.error(`❌ Fonction ${funcName} n'a pas de clause SECURITY`);
      return false;
    }
  }
  
  console.log('✅ Toutes les fonctions ont une clause SECURITY\n');
  return true;
}

async function verifyConstraints() {
  console.log('🔍 Vérification des contraintes de validation...\n');
  
  const { data: constraints, error } = await client
    .from('pg_constraint')
    .select('*')
    .eq('contype', 'c') // CHECK constraints
    .in('conrelid::regclass::text', [
      'public.user_profiles',
      'public.software_licenses',
      'public.assets',
      'public.license_assignments'
    ]);
    
  if (error) {
    console.error('❌ Erreur:', error);
    return false;
  }
  
  const requiredConstraints = [
    'check_email_format',
    'check_expiration_date_valid',
    'check_total_seats_positive',
    'check_assignment_target'
  ];
  
  const foundConstraints = constraints?.map(c => c.conname) || [];
  const missingConstraints = requiredConstraints.filter(
    c => !foundConstraints.includes(c)
  );
  
  if (missingConstraints.length > 0) {
    console.error('❌ Contraintes manquantes:');
    missingConstraints.forEach(c => {
      console.error(`  - ${c}`);
    });
    return false;
  }
  
  console.log('✅ Toutes les contraintes de validation sont en place\n');
  return true;
}

async function main() {
  console.log('🚀 Vérification des corrections de sécurité\n');
  console.log('='.repeat(50) + '\n');
  
  const results = await Promise.all([
    verifyRLSPolicies(),
    verifyFunctionSecurity(),
    verifyConstraints()
  ]);
  
  console.log('='.repeat(50) + '\n');
  
  if (results.every(r => r)) {
    console.log('✅ Toutes les vérifications ont réussi!');
    process.exit(0);
  } else {
    console.error('❌ Certaines vérifications ont échoué');
    process.exit(1);
  }
}

main().catch(console.error);
```

### 5. Instructions d'application

```bash
# 1. Appliquer les migrations dans l'ordre
pnpm --filter web supabase migrations up

# 2. Vérifier que les migrations ont été appliquées
pnpm --filter web supabase db diff

# 3. Exécuter le script de vérification
pnpm tsx apps/web/scripts/verify-security-fixes.ts

# 4. Régénérer les types TypeScript
pnpm supabase:web:typegen

# 5. Exécuter les tests
pnpm --filter web supabase:test
```

### 6. Checklist de validation

- [ ] Migrations appliquées sans erreur
- [ ] Script de vérification passe
- [ ] Types TypeScript régénérés
- [ ] Tests SQL passent
- [ ] Tests E2E passent
- [ ] Aucune régression fonctionnelle
- [ ] Documentation mise à jour

---

**IMPORTANT**: Ces corrections doivent être appliquées en environnement de staging d'abord, puis testées exhaustivement avant le déploiement en production.
