
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

REVOKE SELECT ON public.folders FROM anon;
REVOKE SELECT ON public.items FROM anon;
REVOKE SELECT ON public.tags FROM anon;
REVOKE SELECT ON public.item_tags FROM anon;
REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.user_activity FROM anon;
