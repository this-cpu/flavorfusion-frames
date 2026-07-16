ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS protein_g NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS carbs_g   NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS fat_g     NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS fiber_g   NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS sugar_g   NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS sodium_mg NUMERIC(8,2);

DO $$
DECLARE
  r RECORD;
  admin_uid CONSTANT uuid := 'a0000000-0000-4000-8000-000000000001';
  chef_uid  CONSTANT uuid := 'a0000000-0000-4000-8000-000000000002';
  cook_uid  CONSTANT uuid := 'a0000000-0000-4000-8000-000000000003';
BEGIN
  FOR r IN
    SELECT uid::uuid AS uid, email, pwd, display_name, role FROM (VALUES
      ('a0000000-0000-4000-8000-000000000001','admin@saveur.dev','admin1234','Ava Admin','admin'),
      ('a0000000-0000-4000-8000-000000000002','chef@saveur.dev','chef1234','Chef Marco','chef'),
      ('a0000000-0000-4000-8000-000000000003','homecook@saveur.dev','homecook1234','Home Cook Jamie','homecook')
    ) AS t(uid, email, pwd, display_name, role)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = r.uid) THEN
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data,
        confirmation_token, email_change, email_change_token_new, recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        r.uid, 'authenticated', 'authenticated',
        r.email, crypt(r.pwd, gen_salt('bf')),
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('display_name', r.display_name, 'role', r.role),
        '', '', '', ''
      );
      INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      VALUES (gen_random_uuid(), r.uid, r.uid::text,
              jsonb_build_object('sub', r.uid::text, 'email', r.email, 'email_verified', true),
              'email', now(), now(), now());
    END IF;
  END LOOP;

  DELETE FROM public.user_roles WHERE user_id = admin_uid;
  INSERT INTO public.user_roles (user_id, role) VALUES (admin_uid, 'admin');
  DELETE FROM public.user_roles WHERE user_id = chef_uid;
  INSERT INTO public.user_roles (user_id, role) VALUES (chef_uid, 'chef');
END $$;

INSERT INTO public.recipes (author_id, title, description, image_url, category_id,
  prep_time_min, cook_time_min, servings, difficulty, calories,
  protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg,
  ingredients, steps, tags, is_published)
SELECT author_id, title, description, image_url, category_id,
  prep_time_min, cook_time_min, servings, difficulty, calories,
  protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg,
  to_jsonb(ingredients), to_jsonb(steps), tags, is_published
FROM (VALUES
  ('a0000000-0000-4000-8000-000000000002'::uuid, 'Creamy Tuscan Chicken',
   'Pan-seared chicken in a sun-dried tomato & spinach cream sauce.',
   'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1400&q=70',
   2, 15, 25, 4, 'Medium', 520, 42, 12, 34, 2, 4, 720,
   ARRAY['4 chicken breasts','2 tbsp olive oil','3 garlic cloves, minced','1 cup heavy cream','1/2 cup parmesan','1/2 cup sun-dried tomatoes','2 cups baby spinach','Salt & pepper'],
   ARRAY['Season chicken with salt & pepper.','Sear in olive oil until golden, 5 min per side. Remove.','Saute garlic, add cream, parmesan and sun-dried tomatoes.','Return chicken, add spinach, simmer 5 min.','Serve over pasta or rice.'],
   ARRAY['chicken','dinner','italian'], TRUE),
  ('a0000000-0000-4000-8000-000000000002'::uuid, 'Classic Margherita Pizza',
   'Blistered crust, San Marzano tomato, fresh mozzarella and basil.',
   'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=1400&q=70',
   2, 90, 12, 2, 'Medium', 640, 26, 78, 22, 4, 6, 980,
   ARRAY['300g pizza dough','1/2 cup crushed tomatoes','150g fresh mozzarella','Fresh basil','Olive oil','Sea salt'],
   ARRAY['Preheat oven to 260C with pizza stone.','Stretch dough, spread tomato.','Top with torn mozzarella.','Bake 8-10 min until charred.','Finish with basil, oil and salt.'],
   ARRAY['pizza','italian','vegetarian'], TRUE),
  ('a0000000-0000-4000-8000-000000000003'::uuid, 'Fluffy Buttermilk Pancakes',
   'Weekend-perfect pancakes with crispy edges and pillowy centers.',
   'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1400&q=70',
   1, 10, 15, 4, 'Easy', 380, 9, 55, 13, 2, 12, 520,
   ARRAY['2 cups flour','2 tbsp sugar','1 tsp baking soda','2 cups buttermilk','2 eggs','3 tbsp melted butter'],
   ARRAY['Whisk dry ingredients.','Whisk wet ingredients separately.','Combine, do not overmix.','Cook 1/4 cup portions on medium heat until bubbles form, flip.','Serve with maple syrup.'],
   ARRAY['breakfast','sweet'], TRUE),
  ('a0000000-0000-4000-8000-000000000002'::uuid, 'Street-Style Chicken Tacos',
   'Charred chicken thighs, pickled onion, lime crema on warm corn tortillas.',
   'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1400&q=70',
   3, 20, 15, 4, 'Easy', 460, 32, 38, 18, 5, 3, 650,
   ARRAY['600g chicken thighs','2 tsp smoked paprika','1 tsp cumin','8 corn tortillas','1/2 red onion, pickled','1/4 cup crema','Cilantro','Lime'],
   ARRAY['Toss chicken with spices, salt.','Grill or sear 4 min per side until charred.','Rest, then chop.','Warm tortillas.','Assemble with chicken, onion, crema, cilantro, lime.'],
   ARRAY['mexican','quick','dinner'], TRUE),
  ('a0000000-0000-4000-8000-000000000002'::uuid, 'Miso-Glazed Salmon',
   'Umami-rich salmon with a caramelized miso crust in under 20 minutes.',
   'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=1400&q=70',
   4, 10, 10, 2, 'Easy', 410, 34, 12, 24, 1, 8, 890,
   ARRAY['2 salmon fillets','3 tbsp white miso','2 tbsp mirin','1 tbsp soy sauce','1 tbsp honey','1 tsp grated ginger'],
   ARRAY['Whisk miso, mirin, soy, honey, ginger.','Marinate salmon 20 min (or overnight).','Broil 6-8 min until glaze bubbles.','Rest 2 min. Serve with rice.'],
   ARRAY['seafood','healthy','japanese'], TRUE),
  ('a0000000-0000-4000-8000-000000000003'::uuid, 'Molten Chocolate Lava Cake',
   'Individual cakes with a warm, oozing dark-chocolate center.',
   'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1400&q=70',
   5, 15, 12, 4, 'Medium', 540, 7, 58, 32, 3, 42, 220,
   ARRAY['170g dark chocolate','170g butter','3 eggs + 3 yolks','1/2 cup sugar','1/4 cup flour','Butter for ramekins'],
   ARRAY['Preheat oven 220C. Butter and cocoa-dust 4 ramekins.','Melt chocolate + butter.','Whisk eggs, yolks, sugar until thick.','Fold in chocolate then flour.','Bake 10-12 min, edges set, center jiggly.'],
   ARRAY['dessert','chocolate'], TRUE),
  ('a0000000-0000-4000-8000-000000000003'::uuid, 'Rainbow Buddha Bowl',
   'Roasted veg, quinoa, hummus and tahini drizzle. Wholesome and colorful.',
   'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1400&q=70',
   6, 15, 25, 2, 'Easy', 520, 18, 68, 20, 12, 10, 610,
   ARRAY['1 cup quinoa','1 sweet potato, cubed','1 cup chickpeas','2 cups kale','1/4 cup hummus','Tahini','Lemon','Olive oil'],
   ARRAY['Roast sweet potato and chickpeas at 220C for 25 min.','Cook quinoa.','Massage kale with lemon + oil.','Assemble bowl, top with hummus and tahini.'],
   ARRAY['vegetarian','healthy','bowl'], TRUE),
  ('a0000000-0000-4000-8000-000000000002'::uuid, 'Thai Green Curry',
   'Fragrant coconut curry with chicken, bamboo, and Thai basil.',
   'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1400&q=70',
   7, 15, 20, 4, 'Medium', 480, 28, 24, 30, 3, 6, 920,
   ARRAY['3 tbsp green curry paste','400ml coconut milk','500g chicken thigh','1 cup bamboo shoots','2 kaffir lime leaves','Thai basil','Fish sauce','Sugar'],
   ARRAY['Fry curry paste with thick coconut cream.','Add chicken, cook 5 min.','Add remaining coconut milk, lime leaves, bamboo.','Simmer 10 min. Season with fish sauce & sugar.','Finish with basil.'],
   ARRAY['thai','spicy','dinner'], TRUE),
  ('a0000000-0000-4000-8000-000000000002'::uuid, 'Smoky BBQ Pulled Pork',
   'Low-and-slow shoulder shredded and tossed in tangy sauce.',
   'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=70',
   8, 20, 360, 8, 'Hard', 620, 38, 22, 40, 1, 14, 1100,
   ARRAY['2kg pork shoulder','3 tbsp BBQ rub','1 cup apple juice','1 cup BBQ sauce','Buns and slaw'],
   ARRAY['Rub pork liberally, rest 1 hr.','Smoke or slow-oven at 120C for 5-6 hrs to 96C internal.','Wrap with apple juice, rest 30 min.','Shred, toss with sauce.','Serve on buns with slaw.'],
   ARRAY['bbq','pork','weekend'], TRUE),
  ('a0000000-0000-4000-8000-000000000003'::uuid, 'No-Knead Crusty Bread',
   'Artisan-style loaf with a golden crust with just flour, water, salt, yeast.',
   'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1400&q=70',
   9, 20, 45, 8, 'Easy', 180, 6, 36, 1, 2, 1, 280,
   ARRAY['3 cups flour','1/4 tsp instant yeast','1 1/4 tsp salt','1 1/2 cups water'],
   ARRAY['Mix everything into a shaggy dough. Rest 12-18 hrs at room temp.','Shape into a ball, rest 2 hrs.','Preheat Dutch oven to 230C.','Bake covered 30 min, uncovered 15 min.'],
   ARRAY['baking','bread'], TRUE),
  ('a0000000-0000-4000-8000-000000000003'::uuid, 'Fresh Berry Smoothie',
   'Bright, creamy smoothie packed with antioxidants and fiber.',
   'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=1400&q=70',
   10, 5, 0, 2, 'Easy', 210, 6, 34, 4, 6, 22, 90,
   ARRAY['1 cup mixed berries','1 banana','1 cup yogurt','1/2 cup milk','1 tbsp honey','Ice'],
   ARRAY['Add everything to a blender.','Blend until smooth.','Pour, garnish with berries.'],
   ARRAY['drinks','healthy','breakfast'], TRUE),
  ('a0000000-0000-4000-8000-000000000003'::uuid, 'Mediterranean Chopped Salad',
   'Crunchy, herby salad with feta, olives and a lemon-oregano dressing.',
   'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1400&q=70',
   11, 15, 0, 4, 'Easy', 260, 7, 16, 20, 4, 6, 640,
   ARRAY['2 cucumbers','3 tomatoes','1/2 red onion','1 cup feta','1/2 cup kalamata olives','Olive oil','Lemon','Oregano'],
   ARRAY['Chop veggies uniformly.','Whisk oil, lemon, oregano, salt, pepper.','Toss everything with feta and olives.','Chill 10 min before serving.'],
   ARRAY['salad','mediterranean','healthy'], TRUE),
  ('a0000000-0000-4000-8000-000000000002'::uuid, 'Roasted Tomato Basil Soup',
   'Silky roasted tomato soup with fresh basil and a swirl of cream.',
   'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=70',
   12, 10, 40, 4, 'Easy', 240, 5, 28, 12, 5, 14, 720,
   ARRAY['1 kg tomatoes','1 onion','4 garlic cloves','2 cups stock','1/2 cup cream','Fresh basil','Olive oil'],
   ARRAY['Roast tomatoes, onion, garlic with oil at 220C for 30 min.','Blend with stock until smooth.','Simmer 10 min, stir in cream and basil.','Season and serve with bread.'],
   ARRAY['soup','vegetarian','comfort'], TRUE)
) AS v(author_id, title, description, image_url, category_id, prep_time_min, cook_time_min, servings, difficulty, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, ingredients, steps, tags, is_published)
WHERE NOT EXISTS (SELECT 1 FROM public.recipes WHERE title = v.title);