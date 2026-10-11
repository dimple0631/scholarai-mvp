-- ScholarAI initial schema draft. Review before applying to a real Supabase project.
create extension if not exists pgcrypto;

create type public.plan_tier as enum ('free', 'standard', 'premium');
create type public.verification_status as enum ('unverified', 'needs_review', 'verified');
create type public.eligibility_state as enum ('eligible_on_recorded_criteria', 'check_eligibility', 'not_eligible');
create type public.application_status as enum ('interested', 'preparing', 'ready_to_submit', 'submitted', 'decision_received', 'accepted', 'rejected', 'withdrawn');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  residence_country text,
  nationality text,
  second_nationality text,
  qualification text,
  grading_scale text,
  grade_value text,
  intended_level text,
  field_of_study text,
  preferred_destinations text[] not null default '{}',
  annual_budget numeric(12,2),
  budget_currency char(3),
  budget_covers text,
  funding_sources text[] not null default '{}',
  target_intake text,
  english_test_status text,
  plan public.plan_tier not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  university_name text not null,
  program_name text not null,
  country text not null,
  city text,
  level text,
  field_of_study text,
  tuition_amount numeric(12,2),
  tuition_currency char(3),
  tuition_period text,
  international_student_category text,
  duration_years numeric(4,2),
  intake text,
  admission_requirements jsonb not null default '[]',
  official_source_url text not null,
  last_verified_at date,
  verification_status public.verification_status not null default 'unverified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.scholarships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  provider text,
  eligible_nationalities text[] not null default '{}',
  eligible_residences text[] not null default '{}',
  eligible_levels text[] not null default '{}',
  eligible_fields text[] not null default '{}',
  eligible_countries text[] not null default '{}',
  criteria jsonb not null default '[]',
  coverage jsonb not null default '{}',
  opening_date date,
  closing_date date,
  deadline_timezone text,
  required_documents jsonb not null default '[]',
  renewal_conditions text,
  official_source_url text not null,
  last_verified_at date,
  verification_status public.verification_status not null default 'unverified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shortlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid references public.programs(id) on delete cascade,
  scholarship_id uuid references public.scholarships(id) on delete cascade,
  notes text,
  created_at timestamptz not null default now(),
  constraint shortlist_one_target check ((program_id is not null)::int + (scholarship_id is not null)::int = 1),
  unique(user_id, program_id),
  unique(user_id, scholarship_id)
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid not null references public.programs(id),
  intake text,
  deadline date,
  deadline_source text not null default 'student_entered',
  status public.application_status not null default 'interested',
  notes text,
  submitted_at timestamptz,
  decision_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.application_tasks (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  title text not null,
  due_date date,
  completed_at timestamptz,
  source text not null default 'rule_based',
  created_at timestamptz not null default now()
);

create table public.cost_scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid references public.programs(id) on delete set null,
  currency char(3) not null,
  annual_tuition numeric(12,2) not null default 0,
  annual_living numeric(12,2) not null default 0,
  annual_insurance_transport_other numeric(12,2) not null default 0,
  one_time_costs numeric(12,2) not null default 0,
  confirmed_annual_funding numeric(12,2) not null default 0,
  duration_years numeric(4,2),
  assumptions jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.record_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  record_type text not null check (record_type in ('program','scholarship')),
  record_id uuid not null,
  message text not null,
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now()
);

create table public.subscription_entitlements (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  plan public.plan_tier not null default 'free',
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  status text not null default 'inactive',
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

-- Enable RLS for student-owned data. Catalogue tables are readable by signed-in users;
-- admin write access must be implemented with a trusted server role, never a browser secret.
alter table public.profiles enable row level security;
alter table public.shortlist_items enable row level security;
alter table public.applications enable row level security;
alter table public.application_tasks enable row level security;
alter table public.cost_scenarios enable row level security;
alter table public.record_reports enable row level security;
alter table public.subscription_entitlements enable row level security;
alter table public.programs enable row level security;
alter table public.scholarships enable row level security;

create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users manage own shortlist" on public.shortlist_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own applications" on public.applications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage tasks for own applications" on public.application_tasks for all using (exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid())) with check (exists (select 1 from public.applications a where a.id = application_id and a.user_id = auth.uid()));
create policy "Users manage own cost scenarios" on public.cost_scenarios for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users create own record reports" on public.record_reports for insert with check (auth.uid() = user_id);
create policy "Users read own record reports" on public.record_reports for select using (auth.uid() = user_id);
create policy "Users read own entitlements" on public.subscription_entitlements for select using (auth.uid() = user_id);
create policy "Signed-in users read programs" on public.programs for select to authenticated using (true);
create policy "Signed-in users read scholarships" on public.scholarships for select to authenticated using (true);

-- IMPORTANT: Admin/catalogue writes and subscription changes must use trusted server-side
-- credentials or carefully scoped admin policies. Never expose service-role keys to the client.
