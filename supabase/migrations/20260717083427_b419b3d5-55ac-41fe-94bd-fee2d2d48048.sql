
CREATE POLICY "users upload own evidence" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'role-evidence' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "users read own evidence" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'role-evidence' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "users delete own evidence" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'role-evidence' AND (storage.foldername(name))[1] = auth.uid()::text);
