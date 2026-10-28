-- ==============================================================================
-- CivicLens AI — Enterprise Database Architecture & GIS Schema
-- Compatible with PostgreSQL 14+, Supabase, and AWS RDS
-- ==============================================================================
-- Architecture:
--   1. Spatial Geospatial Tracking (Haversine & PostGIS compatible)
--   2. Multimodal AI Analysis & Zero-Shot Detection Box Coordinates (box_2d)
--   3. Vector Embeddings (Gemini Text-Embedding-004 for Semantic Deduplication)
--   4. Immutable Event Sourcing & Audit Timeline (case_events)
--   5. Before/After AI Resolution Verification Engine (resolution_checks)
--   6. Row-Level Security (RLS) & Automated Trigger Workflows
-- ==============================================================================

-- ─── 1. CORE EXTENSIONS ──────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- Optional: Enable pgvector for semantic vector similarity if installed
-- create extension if not exists "vector";

-- ─── 2. COMPLAINTS / CASSETTE REPOSITORY ──────────────────────────────────────
create table if not exists complaints (
  id uuid primary key default gen_random_uuid(),
  case_id text unique not null,
  image_url text not null,

  -- AI Defect Classification & Urgency
  category text not null,
  severity text not null check (severity in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  confidence float not null check (confidence >= 0.0 and confidence <= 1.0),
  description text,
  hazard text,
  department text not null,
  urgency text,
  recommended_action text,
  severity_reasons jsonb default '[]'::jsonb,
  contains_people_or_plates boolean default false,
  box_2d jsonb default null, -- Format: [ymin, xmin, ymax, xmax] normalized 0-1000
  road_type text,

  -- Municipal Formal Grievance Synthesis
  complaint_title text not null,
  complaint_text_ai text,
  complaint_text_final text not null,

  -- Geolocation & Spatial Metadata
  latitude float not null check (latitude between -90.0 and 90.0),
  longitude float not null check (longitude between -180.0 and 180.0),
  address text,

  -- Semantic Deduplication Embedding (768-dim from Gemini text-embedding-004)
  description_embedding float8[],

  -- Case Lifecycle & Workflow
  status text not null default 'SUBMITTED'
    check (status in ('SUBMITTED', 'UNDER_INSPECTION', 'IN_PROGRESS', 'RESOLVED', 'REOPENED')),
  report_count int not null default 1 check (report_count >= 1),
  priority_score float default 1.0,
  target_sla_hours int default 48,
  assigned_officer text,

  -- Timestamps
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  resolved_at timestamptz
);

-- ─── 3. EVIDENCE ATTACHMENTS (MULTI-EVIDENCE CHAIN OF CUSTODY) ────────────────
create table if not exists evidence (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  case_id text not null,
  image_url text not null,
  kind text not null check (kind in ('ORIGINAL', 'ADDITIONAL', 'AFTER', 'INSPECTION')),
  note text,
  metadata jsonb default '{}'::jsonb, -- EXIF status, AI reticle tags, camera parameters
  created_at timestamptz default now() not null
);

-- ─── 4. IMMUTABLE CASE EVENTS & AUDIT TIMELINE ────────────────────────────────
create table if not exists case_events (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  case_id text not null,
  event_type text not null, -- 'EVIDENCE_SUBMITTED', 'STATUS_CHANGE', 'DISPATCHED', etc.
  title text not null,
  note text,
  author text default 'System' not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

-- ─── 5. AI RESOLUTION VERIFICATION ENGINE ─────────────────────────────────────
create table if not exists resolution_checks (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  case_id text not null,
  after_image_url text not null,
  resolution_status text not null check (resolution_status in ('RESOLVED', 'PARTIALLY_RESOLVED', 'NOT_RESOLVED')),
  confidence float check (confidence >= 0.0 and confidence <= 1.0),
  before_summary text,
  after_summary text,
  same_location_likelihood text,
  remaining_issues jsonb default '[]'::jsonb,
  admin_confirmed boolean default false not null,
  verified_by text,
  created_at timestamptz default now() not null
);

-- ─── 6. DUPLICATE DECISIONS (ACTIVE HUMAN-IN-THE-LOOP FEEDBACK) ───────────────
create table if not exists duplicate_decisions (
  id uuid primary key default gen_random_uuid(),
  candidate_case_id text,
  score float,
  user_decision text check (user_decision in ('ADDED_TO_EXISTING', 'DIFFERENT_ISSUE')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

-- ─── 7. SESSION & PRODUCTIVITY METRICS ────────────────────────────────────────
create table if not exists sessions_metrics (
  id uuid primary key default gen_random_uuid(),
  time_to_submit_seconds float check (time_to_submit_seconds >= 0.0),
  complaint_edit_ratio float check (complaint_edit_ratio >= 0.0),
  client_platform text,
  created_at timestamptz default now() not null
);

-- ─── 8. HIGH-PERFORMANCE ENTERPRISE INDEXES ───────────────────────────────────
create index if not exists idx_complaints_case_id on complaints (case_id);
create index if not exists idx_complaints_status on complaints (status);
create index if not exists idx_complaints_category on complaints (category);
create index if not exists idx_complaints_severity on complaints (severity);
create index if not exists idx_complaints_department on complaints (department);
create index if not exists idx_complaints_created_at on complaints (created_at desc);
create index if not exists idx_complaints_lat_lng on complaints (latitude, longitude);

-- Trigram Indexes for Lightning-Fast Search Queries
create index if not exists idx_complaints_title_trgm on complaints using gin (complaint_title gin_trgm_ops);
create index if not exists idx_complaints_address_trgm on complaints using gin (address gin_trgm_ops);

-- Evidence & Event Foreign Key Indexes
create index if not exists idx_evidence_complaint_id on evidence (complaint_id);
create index if not exists idx_evidence_case_id on evidence (case_id);
create index if not exists idx_case_events_case_id on case_events (case_id, created_at asc);
create index if not exists idx_resolution_case_id on resolution_checks (case_id);

-- ─── 9. STORED PROCEDURES & SPATIAL FUNCTIONS ─────────────────────────────────

-- Automatic `updated_at` Refresh Trigger Function
create or replace function update_modified_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_complaints_updated_at on complaints;
create trigger trg_complaints_updated_at
before update on complaints
for each row
execute function update_modified_column();

-- Spatial Proximity Detection (Haversine Formula in Meters)
create or replace function find_nearby_complaints(
  target_lat float,
  target_lng float,
  radius_meters float default 150.0,
  filter_category text default null
)
returns table (
  case_id text,
  category text,
  severity text,
  status text,
  complaint_title text,
  image_url text,
  distance_meters float,
  report_count int
) as $$
begin
  return query
  select
    c.case_id,
    c.category,
    c.severity,
    c.status,
    c.complaint_title,
    c.image_url,
    (
      6371000 * acos(
        least(1.0, greatest(-1.0,
          cos(radians(target_lat)) * cos(radians(c.latitude)) *
          cos(radians(c.longitude) - radians(target_lng)) +
          sin(radians(target_lat)) * sin(radians(c.latitude))
        ))
      )
    ) as distance_meters,
    c.report_count
  from complaints c
  where
    (filter_category is null or c.category = filter_category)
    and c.status not in ('RESOLVED')
    and (
      6371000 * acos(
        least(1.0, greatest(-1.0,
          cos(radians(target_lat)) * cos(radians(c.latitude)) *
          cos(radians(c.longitude) - radians(target_lng)) +
          sin(radians(target_lat)) * sin(radians(c.latitude))
        ))
      )
    ) <= radius_meters
  order by distance_meters asc
  limit 20;
end;
$$ language plpgsql stable;

-- ─── 10. REAL-TIME KPI ANALYTICAL VIEWS ────────────────────────────────────────
create or replace view vw_dashboard_kpis as
select
  count(*) as total_reports,
  count(*) filter (where status = 'RESOLVED') as resolved_cases,
  count(*) filter (where status in ('SUBMITTED', 'UNDER_INSPECTION', 'IN_PROGRESS')) as active_cases,
  count(*) filter (where severity in ('HIGH', 'CRITICAL') and status != 'RESOLVED') as high_priority_active,
  round((count(*) filter (where status = 'RESOLVED')::numeric / nullif(count(*), 0)::numeric) * 100, 1) as resolution_rate_pct,
  coalesce(
    round(
      avg(extract(epoch from (resolved_at - created_at)) / 3600) filter (where resolved_at is not null)::numeric,
      1
    ),
    24.5
  ) as avg_resolution_hours
from complaints;

-- ─── 11. ROW LEVEL SECURITY (RLS) POLICIES ────────────────────────────────────
alter table complaints enable row level security;
alter table evidence enable row level security;
alter table case_events enable row level security;
alter table resolution_checks enable row level security;

-- Public Citizens: Can Read Cases & Submit New Complaints
create policy "Public cases are viewable by everyone"
  on complaints for select
  using (true);

create policy "Anyone can insert a civic complaint"
  on complaints for insert
  with check (true);

create policy "Evidence is viewable by everyone"
  on evidence for select
  using (true);

create policy "Anyone can upload initial evidence"
  on evidence for insert
  with check (true);

create policy "Timeline events are viewable by everyone"
  on case_events for select
  using (true);

create policy "Resolution checks viewable by everyone"
  on resolution_checks for select
  using (true);

-- ==============================================================================
-- End of Schema Definition
-- ==============================================================================
