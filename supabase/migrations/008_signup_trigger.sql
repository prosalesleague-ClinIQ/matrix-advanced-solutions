-- Migration 008: Auto-create user + clinic records on signup
--
-- When a new user registers via Supabase Auth, this trigger automatically:
-- 1. Creates a new clinic row using the clinic_name from signup metadata
-- 2. Creates a new users row linked to that clinic
-- 3. Sets onboarding_status = 'pending' so they enter the onboarding wizard

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_clinic_id UUID;
  v_full_name TEXT;
  v_clinic_name TEXT;
BEGIN
  -- Extract metadata passed from the signup form
  v_full_name  := COALESCE(NEW.raw_user_meta_data ->> 'full_name', '');
  v_clinic_name := COALESCE(NEW.raw_user_meta_data ->> 'clinic_name', 'Unnamed Clinic');

  -- 1. Create the clinic
  INSERT INTO public.clinics (
    name,
    primary_contact_name,
    primary_email,
    onboarding_status
  ) VALUES (
    v_clinic_name,
    v_full_name,
    NEW.email,
    'pending'
  )
  RETURNING id INTO new_clinic_id;

  -- 2. Create the user profile linked to that clinic
  INSERT INTO public.users (
    id,
    clinic_id,
    role,
    full_name,
    email
  ) VALUES (
    NEW.id,
    new_clinic_id,
    'clinic_admin',
    v_full_name,
    NEW.email
  );

  RETURN NEW;
END;
$$;

-- Drop any existing trigger, then re-create pointing at our function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
