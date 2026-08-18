alter table public.partners
add column archived_at timestamptz;

create index partners_archived_at_idx
on public.partners (archived_at)
where archived_at is not null;

drop policy "public partners" on public.partners;

create policy "public partners"
on public.partners
for select
to anon, authenticated
using (
  active
  and archived_at is null
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);
