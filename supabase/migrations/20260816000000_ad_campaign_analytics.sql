-- Agregações administrativas: security invoker mantém o RLS de ad_events e
-- public.is_admin() impede que editores obtenham métricas por RPC.
create index if not exists ad_events_campaign_created_at_idx
  on public.ad_events (campaign_id, created_at desc);

create index if not exists ad_events_created_at_placement_idx
  on public.ad_events (created_at desc, placement);

create or replace function public.get_ad_campaign_metrics(
  p_since timestamptz default null,
  p_campaign_id uuid default null
)
returns table (
  campaign_id uuid,
  impressions bigint,
  clicks bigint
)
language sql
security invoker
set search_path = ''
stable
as $$
  select
    event.campaign_id,
    count(*) filter (where event.event_type = 'impression')::bigint as impressions,
    count(*) filter (where event.event_type = 'click')::bigint as clicks
  from public.ad_events as event
  where (select public.is_admin())
    and (p_since is null or event.created_at >= p_since)
    and (p_campaign_id is null or event.campaign_id = p_campaign_id)
  group by event.campaign_id;
$$;

create or replace function public.get_ad_placement_metrics(
  p_since timestamptz default null
)
returns table (
  placement text,
  impressions bigint,
  clicks bigint
)
language sql
security invoker
set search_path = ''
stable
as $$
  select
    event.placement,
    count(*) filter (where event.event_type = 'impression')::bigint as impressions,
    count(*) filter (where event.event_type = 'click')::bigint as clicks
  from public.ad_events as event
  where (select public.is_admin())
    and (p_since is null or event.created_at >= p_since)
  group by event.placement;
$$;

create or replace function public.get_ad_campaign_daily_metrics(
  p_campaign_id uuid,
  p_since timestamptz default null
)
returns table (
  event_day date,
  impressions bigint,
  clicks bigint
)
language sql
security invoker
set search_path = ''
stable
as $$
  select
    date_trunc('day', event.created_at)::date as event_day,
    count(*) filter (where event.event_type = 'impression')::bigint as impressions,
    count(*) filter (where event.event_type = 'click')::bigint as clicks
  from public.ad_events as event
  where (select public.is_admin())
    and event.campaign_id = p_campaign_id
    and (p_since is null or event.created_at >= p_since)
  group by date_trunc('day', event.created_at)::date
  order by event_day asc;
$$;

revoke all on function public.get_ad_campaign_metrics(timestamptz, uuid) from public;
revoke all on function public.get_ad_placement_metrics(timestamptz) from public;
revoke all on function public.get_ad_campaign_daily_metrics(uuid, timestamptz) from public;

grant execute on function public.get_ad_campaign_metrics(timestamptz, uuid) to authenticated;
grant execute on function public.get_ad_placement_metrics(timestamptz) to authenticated;
grant execute on function public.get_ad_campaign_daily_metrics(uuid, timestamptz) to authenticated;
