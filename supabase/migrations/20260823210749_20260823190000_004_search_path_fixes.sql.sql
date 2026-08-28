-- Fix search_path on normalize_code and update_updated_at_column
ALTER FUNCTION public.normalize_code(text) SET search_path = public;

ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
