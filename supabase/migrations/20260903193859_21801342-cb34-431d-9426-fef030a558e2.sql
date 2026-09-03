CREATE POLICY "media_public_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'media');
CREATE POLICY "media_admin_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "media_admin_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.is_admin()) WITH CHECK (bucket_id = 'media' AND public.is_admin());
CREATE POLICY "media_admin_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.is_admin());

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;