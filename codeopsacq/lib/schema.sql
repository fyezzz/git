CREATE TABLE IF NOT EXISTS settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  workspace_name text NOT NULL DEFAULT 'CodeOpsAcq',
  timezone text NOT NULL DEFAULT 'America/New_York',
  mrr_target_cents integer NOT NULL DEFAULT 30000000,
  pipeline_target_cents integer NOT NULL DEFAULT 90000000,
  brand_color text NOT NULL DEFAULT '#02EF7D',
  contact_email text NOT NULL DEFAULT 'hello@codeopsacq.com'
);

CREATE TABLE IF NOT EXISTS members (
  id text PRIMARY KEY,
  name text NOT NULL,
  initials text NOT NULL,
  title text NOT NULL
);

CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  industry text NOT NULL DEFAULT 'Other',
  title text NOT NULL,
  seats integer,
  value_cents integer NOT NULL DEFAULT 0,
  stage text NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead','contacted','qualified','proposal','won','lost','fridge')),
  ai_score integer NOT NULL DEFAULT 50 CHECK (ai_score BETWEEN 0 AND 100),
  signal text NOT NULL DEFAULT '',
  owner_id text REFERENCES members(id),
  contact_name text,
  contact_email text,
  next_step text,
  channel text NOT NULL DEFAULT 'direct',
  ai_engine text,
  attribution jsonb NOT NULL DEFAULT '{}'::jsonb,
  first_response_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  stage_changed_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);
CREATE INDEX IF NOT EXISTS deals_stage_idx ON deals(stage);
CREATE INDEX IF NOT EXISTS deals_channel_idx ON deals(channel);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client text NOT NULL,
  plan text NOT NULL,
  mrr_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled')),
  started_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz
);

CREATE TABLE IF NOT EXISTS lead_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  contributors integer NOT NULL DEFAULT 0,
  evidence text NOT NULL,
  classification text NOT NULL CHECK (classification IN ('evidence','hypothesis')),
  score integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS suppression (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text NOT NULL UNIQUE,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  touches integer NOT NULL DEFAULT 3,
  enrolled integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused'))
);

CREATE TABLE IF NOT EXISTS catalog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('plan','module','addon','enterprise')),
  price_cents integer,
  cost_cents integer NOT NULL DEFAULT 0,
  price_min_cents integer,
  price_max_cents integer,
  UNIQUE (category, name)
);

CREATE TABLE IF NOT EXISTS developers (
  id text PRIMARY KEY,
  label text NOT NULL,
  initials text NOT NULL,
  specialty text NOT NULL,
  slots integer NOT NULL DEFAULT 4
);

CREATE SEQUENCE IF NOT EXISTS ticket_seq START 1046;
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE DEFAULT ('DEV-' || nextval('ticket_seq')),
  title text NOT NULL,
  project_type text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('standard','high','urgent')),
  requirements text NOT NULL DEFAULT '',
  stage text NOT NULL CHECK (stage IN ('scoping','approved','development','qa','delivered')),
  progress integer NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  developer_id text REFERENCES developers(id),
  deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  price_cents integer NOT NULL DEFAULT 0,
  cost_cents integer NOT NULL DEFAULT 0,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz
);

CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL,
  name text NOT NULL,
  summary text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('active','draft'))
);

CREATE TABLE IF NOT EXISTS routing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  match text NOT NULL,
  destination text NOT NULL,
  sla_minutes integer NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','standby')),
  sort integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS legal_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  summary text NOT NULL,
  body text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1001;
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL UNIQUE DEFAULT ('INV-' || nextval('invoice_seq')),
  client text NOT NULL,
  client_email text,
  items jsonb NOT NULL,
  total_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','paid')),
  due_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  title text NOT NULL,
  amount_cents integer NOT NULL,
  closed_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (deal_id)
);

CREATE TABLE IF NOT EXISTS landing_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  path text NOT NULL UNIQUE,
  kind text NOT NULL CHECK (kind IN ('web','email')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published'))
);

CREATE TABLE IF NOT EXISTS manual_metrics (
  key text PRIMARY KEY,
  grp text NOT NULL,
  label text NOT NULL,
  value numeric NOT NULL,
  target numeric NOT NULL,
  unit text NOT NULL,
  better text NOT NULL CHECK (better IN ('up','down')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS page_views (
  id bigserial PRIMARY KEY,
  visitor_id text NOT NULL,
  path text NOT NULL,
  channel text NOT NULL,
  ai_engine text,
  source text,
  at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS page_views_at_idx ON page_views(at);

CREATE TABLE IF NOT EXISTS audit_log (
  id bigserial PRIMARY KEY,
  at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL,
  action text NOT NULL,
  detail text NOT NULL
);
CREATE INDEX IF NOT EXISTS audit_at_idx ON audit_log(at DESC);

CREATE TABLE IF NOT EXISTS ai_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission text NOT NULL,
  agents text[] NOT NULL,
  findings jsonb NOT NULL,
  narrative text,
  created_at timestamptz NOT NULL DEFAULT now()
);
