-- 1. Add the column(s) your trigger needs
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS email       TEXT    NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS full_name   TEXT,
    ADD COLUMN IF NOT EXISTS condition_tags TEXT[] DEFAULT ARRAY[]::text[],
    ADD COLUMN IF NOT EXISTS created_at  timestamptz DEFAULT now();

-- 2. Redefine your trigger to target public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = 'public, auth'
AS $$
BEGIN
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    condition_tags,
    created_at
)
VALUES (
           NEW.id,
           NEW.email,
           COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
           ARRAY[]::text[],
           now()
       );
RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_new_user();
