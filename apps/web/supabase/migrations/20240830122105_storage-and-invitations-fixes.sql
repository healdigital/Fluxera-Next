drop policy "invitations_create_self" on "public"."invitations";

drop policy "account_image" on "storage"."objects";

create policy "invitations_create_self" on "public"."invitations" as permissive for insert to authenticated
with
  check (
    (
      public.is_set ('enable_team_accounts'::text)
      AND public.has_permission (
        (
          SELECT
            auth.uid () AS uid
        ),
        account_id,
        'invites.manage'::app_permissions
      )
      AND (
        public.has_more_elevated_role (
          (
            SELECT
              auth.uid () AS uid
          ),
          account_id,
          role
        )
        OR public.has_same_role_hierarchy_level (
          (
            select
              auth.uid ()
          ),
          account_id,
          role
        )
      )
    )
  );

create policy account_image on storage.objects for all using (
  bucket_id = 'account_image'
  and (
    kit.get_storage_filename_as_uuid (name) = auth.uid ()
    or public.has_role_on_account (kit.get_storage_filename_as_uuid (name))
  )
)
with
  check (
    bucket_id = 'account_image'
    and (
      kit.get_storage_filename_as_uuid (name) = auth.uid ()
      or public.has_permission (
        auth.uid (),
        kit.get_storage_filename_as_uuid (name),
        'settings.manage'
      )
    )
  );
