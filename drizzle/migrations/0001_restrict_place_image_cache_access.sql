REVOKE ALL ON public.place_image_cache FROM anon, authenticated;
DROP POLICY IF EXISTS "Anyone can view cached place images" ON public.place_image_cache;
DROP POLICY IF EXISTS "Signed-in users can add cached place images" ON public.place_image_cache;
DROP POLICY IF EXISTS "Signed-in users can refresh cached place images" ON public.place_image_cache;