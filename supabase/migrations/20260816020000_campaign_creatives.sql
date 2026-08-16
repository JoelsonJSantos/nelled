create table public.ad_campaign_creatives (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.ad_campaigns(id) on delete cascade,
  format text not null check (format in ('horizontal', 'vertical')),
  image_url text not null,
  image_public_id text,
  created_at timestamptz not null default now(),
  unique (campaign_id, format)
);

create index ad_campaign_creatives_campaign_id_idx
  on public.ad_campaign_creatives (campaign_id);

-- Preserva campanhas existentes: a imagem legada é reutilizada apenas como
-- criativo horizontal. Nenhuma arte é inferida ou adaptada para vertical.
insert into public.ad_campaign_creatives (
  campaign_id,
  format,
  image_url,
  image_public_id
)
select
  campaign.id,
  'horizontal',
  campaign.image_url,
  media.public_id
from public.ad_campaigns as campaign
left join lateral (
  select library.public_id
  from public.media_library as library
  where library.url = campaign.image_url
  limit 1
) as media on true
where nullif(btrim(campaign.image_url), '') is not null
on conflict (campaign_id, format) do nothing;

alter table public.ad_campaign_creatives enable row level security;

create policy "public campaign creatives"
on public.ad_campaign_creatives
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.ad_campaigns as campaign
    where campaign.id = ad_campaign_creatives.campaign_id
      and campaign.active
      and (campaign.starts_at is null or campaign.starts_at <= now())
      and (campaign.ends_at is null or campaign.ends_at >= now())
  )
);

create policy "admin campaign creatives"
on public.ad_campaign_creatives
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

grant select on public.ad_campaign_creatives to anon, authenticated;
grant insert, update, delete on public.ad_campaign_creatives to authenticated;

-- Tracking só aceita campanhas que tenham o criativo exigido pelo placement.
create or replace function public.record_ad_event(
  p_campaign_id uuid,
  p_event_type text,
  p_placement text,
  p_page_path text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_event_type not in ('impression', 'click')
    or char_length(p_page_path) > 500
    or p_page_path !~ '^/'
    or p_page_path ~ '[\r\n]'
    or p_placement not in ('home-showcase', 'portfolio-list', 'blog-list', 'blog-post-end', 'partner-detail') then
    return false;
  end if;

  if not exists (
    select 1
    from public.ad_campaigns as campaign
    join public.ad_campaign_creatives as creative
      on creative.campaign_id = campaign.id
      and creative.format = case p_placement
        when 'home-showcase' then 'horizontal'
        when 'blog-post-end' then 'horizontal'
        else 'vertical'
      end
    where campaign.id = p_campaign_id
      and campaign.active
      and p_placement = any(campaign.placements)
      and (campaign.starts_at is null or campaign.starts_at <= now())
      and (campaign.ends_at is null or campaign.ends_at >= now())
  ) then
    return false;
  end if;

  insert into public.ad_events (campaign_id, event_type, placement, page_path)
  values (p_campaign_id, p_event_type, p_placement, p_page_path);

  return true;
end;
$$;

revoke all on function public.record_ad_event(uuid, text, text, text) from public;
grant execute on function public.record_ad_event(uuid, text, text, text) to anon, authenticated;
