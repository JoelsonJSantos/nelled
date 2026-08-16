create table public.contact_status_history (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contact_requests(id) on delete cascade,
  previous_status public.contact_status not null,
  next_status public.contact_status not null,
  author_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index contact_status_history_contact_created_at_idx
  on public.contact_status_history (contact_id, created_at desc);

alter table public.contact_status_history enable row level security;

create policy "admin contact status history"
on public.contact_status_history
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

grant select on public.contact_status_history to authenticated;

create function public.log_contact_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.contact_status_history (
      contact_id,
      previous_status,
      next_status,
      author_id
    )
    values (
      new.id,
      old.status,
      new.status,
      auth.uid()
    );
  end if;

  return new;
end;
$$;

revoke all on function public.log_contact_status_change() from public;

create trigger contact_status_history_after_update
after update of status on public.contact_requests
for each row
execute function public.log_contact_status_change();
