-- roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.admin_roles TO authenticated;
GRANT ALL ON public.admin_roles TO service_role;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

CREATE POLICY "admin_roles_select_own" ON public.admin_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- leads
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  source text,
  webinar_slot timestamptz,
  consent boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_public_insert" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "leads_admin_select" ON public.leads FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "leads_admin_update" ON public.leads FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "leads_admin_delete" ON public.leads FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- site_settings
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings_public_read" ON public.site_settings FOR SELECT TO anon, authenticated USING (is_public = true);
CREATE POLICY "site_settings_admin_all" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- capture_page_content
CREATE TABLE public.capture_page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_key text NOT NULL UNIQUE,
  title text,
  subtitle text,
  body text,
  media_url text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.capture_page_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.capture_page_content TO authenticated;
GRANT ALL ON public.capture_page_content TO service_role;
ALTER TABLE public.capture_page_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "capture_public_read" ON public.capture_page_content FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "capture_admin_read" ON public.capture_page_content FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "capture_admin_write" ON public.capture_page_content FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER capture_updated_at BEFORE UPDATE ON public.capture_page_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- webinar_settings
CREATE TABLE public.webinar_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  title text,
  video_url text,
  duration_seconds integer,
  schedule_mode text NOT NULL DEFAULT 'evergreen',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.webinar_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webinar_settings TO authenticated;
GRANT ALL ON public.webinar_settings TO service_role;
ALTER TABLE public.webinar_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webinar_settings_public_read" ON public.webinar_settings FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "webinar_settings_admin_read" ON public.webinar_settings FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "webinar_settings_admin_write" ON public.webinar_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER webinar_settings_updated_at BEFORE UPDATE ON public.webinar_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- webinar_events
CREATE TABLE public.webinar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  title text,
  trigger_at_seconds integer NOT NULL DEFAULT 0,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.webinar_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webinar_events TO authenticated;
GRANT ALL ON public.webinar_events TO service_role;
ALTER TABLE public.webinar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webinar_events_public_read" ON public.webinar_events FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "webinar_events_admin_read" ON public.webinar_events FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "webinar_events_admin_write" ON public.webinar_events FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER webinar_events_updated_at BEFORE UPDATE ON public.webinar_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- offer_content
CREATE TABLE public.offer_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_key text NOT NULL UNIQUE,
  title text,
  subtitle text,
  body text,
  price_label text,
  bonuses jsonb NOT NULL DEFAULT '[]'::jsonb,
  guarantee text,
  checkout_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.offer_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offer_content TO authenticated;
GRANT ALL ON public.offer_content TO service_role;
ALTER TABLE public.offer_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "offer_public_read" ON public.offer_content FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "offer_admin_read" ON public.offer_content FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "offer_admin_write" ON public.offer_content FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER offer_updated_at BEFORE UPDATE ON public.offer_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();