-- O tracking público não recebe acesso direto à tabela. A função valida a
-- campanha, placement, período e tipo de evento antes de registrar o mínimo
-- necessário para a métrica.
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
    or p_page_path ~ '[\r\n]' then
    return false;
  end if;

  if not exists (
    select 1
    from public.ad_campaigns as campaign
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
