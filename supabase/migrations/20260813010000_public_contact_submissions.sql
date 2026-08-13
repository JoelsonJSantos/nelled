create policy "public contact submissions"
on public.contact_requests
for insert
to anon, authenticated
with check (
  status = 'new'
  and char_length(btrim(name)) between 2 and 120
  and char_length(btrim(email)) between 5 and 254
  and position('@' in email) > 1
  and char_length(btrim(message)) between 10 and 5000
  and (company is null or char_length(company) <= 120)
  and (whatsapp is null or char_length(whatsapp) <= 30)
  and (project_type is null or project_type in ('site', 'sistema', 'saas', 'aplicacao', 'outro'))
  and (budget_range is null or char_length(budget_range) <= 60)
);

grant insert (name, company, email, whatsapp, project_type, budget_range, message)
on public.contact_requests
to anon;
