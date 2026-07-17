
-- 1. meal_type enum + column
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'drink');
ALTER TABLE public.recipes ADD COLUMN meal_type meal_type;

-- Backfill from category slug where obvious
UPDATE public.recipes r SET meal_type = 'breakfast'::meal_type
  FROM public.categories c WHERE r.category_id = c.id AND c.slug IN ('breakfast');
UPDATE public.recipes r SET meal_type = 'dessert'::meal_type
  FROM public.categories c WHERE r.category_id = c.id AND c.slug IN ('desserts','dessert','baking');
UPDATE public.recipes r SET meal_type = 'drink'::meal_type
  FROM public.categories c WHERE r.category_id = c.id AND c.slug IN ('drinks','beverages');
UPDATE public.recipes r SET meal_type = 'snack'::meal_type
  FROM public.categories c WHERE r.category_id = c.id AND c.slug IN ('snacks','appetizers');
UPDATE public.recipes SET meal_type = 'dinner'::meal_type WHERE meal_type IS NULL;

-- 2. Update handle_new_user to default to 'user'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role app_role;
  _role_txt TEXT;
BEGIN
  INSERT INTO public.profiles (id, display_name, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 6)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  _role_txt := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  IF _role_txt NOT IN ('user', 'chef', 'homecook') THEN
    _role_txt := 'user';
  END IF;
  -- Cannot self-assign chef/homecook via metadata; requires application approval
  IF _role_txt IN ('chef', 'homecook') THEN _role_txt := 'user'; END IF;
  _role := _role_txt::app_role;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);
  RETURN NEW;
END; $$;

-- 3. role_applications table
CREATE TABLE public.role_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_role app_role NOT NULL CHECK (requested_role IN ('chef', 'homecook')),
  evidence_url TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_applications TO authenticated;
GRANT ALL ON public.role_applications TO service_role;

ALTER TABLE public.role_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own applications" ON public.role_applications
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users create own applications" ON public.role_applications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins update applications" ON public.role_applications
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users delete own pending applications" ON public.role_applications
  FOR DELETE TO authenticated USING (auth.uid() = user_id AND status = 'pending');

CREATE TRIGGER role_applications_updated_at
  BEFORE UPDATE ON public.role_applications
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 4. ratings table
CREATE TABLE public.ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stars SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (recipe_id, user_id)
);

GRANT SELECT ON public.ratings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ratings TO authenticated;
GRANT ALL ON public.ratings TO service_role;

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ratings visible to all" ON public.ratings
  FOR SELECT USING (true);
CREATE POLICY "users insert own rating" ON public.ratings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own rating" ON public.ratings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users delete own rating" ON public.ratings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER ratings_updated_at
  BEFORE UPDATE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
