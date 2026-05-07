-- ============================================
-- REMOVER VIP DE TODOS OS USUÁRIOS (EXCETO ADMINS)
-- ============================================

-- Remover VIP de todos os usuários comuns
UPDATE public.users
SET 
  is_premium = false,
  premium_since = NULL
WHERE role = 'user';

-- Verificar resultado (com email do auth.users)
SELECT 
  u.id,
  u.name,
  au.email,
  u.role,
  u.is_premium,
  u.premium_since
FROM public.users u
LEFT JOIN auth.users au ON au.id = u.id
ORDER BY u.role DESC, u.name ASC;

-- ============================================
-- OU: Remover VIP de um usuário específico por email
-- ============================================

-- Substitua 'email@exemplo.com' pelo email do usuário
-- UPDATE public.users
-- SET 
--   is_premium = false,
--   premium_since = NULL
-- WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'email@exemplo.com'
-- );

-- ============================================
-- OU: Remover VIP de TODOS (incluindo admins)
-- ============================================

-- CUIDADO: Isso remove VIP até dos admins!
-- UPDATE public.users
-- SET 
--   is_premium = false,
--   premium_since = NULL;
