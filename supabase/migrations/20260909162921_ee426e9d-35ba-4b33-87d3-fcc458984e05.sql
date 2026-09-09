INSERT INTO public.site_settings (key, value, is_public)
VALUES ('offer_preview', jsonb_build_object('token', replace(gen_random_uuid()::text, '-', '')), false)
ON CONFLICT (key) DO NOTHING;