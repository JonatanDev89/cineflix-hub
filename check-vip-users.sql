-- ============================================
-- VERIFICAR USUÁRIOS COM VIP
-- ============================================

-- Listar todos os usuários VIP
SELECT 
  u.id,
  u.name,
  au.email,
  u.role,
  u.is_premium as "VIP?",
  u.premium_since as "VIP desde",
  u.created_at as "Cadastrado em"
FROM public.users u
LEFT JOIN auth.users au ON au.id = u.id
WHERE u.is_premium = true
ORDER BY u.premium_since DESC;

-- ============================================
-- ESTATÍSTICAS
-- ============================================

-- Contagem de usuários por tipo
SELECT 
  role as "Tipo",
  COUNT(*) as "Total",
  SUM(CASE WHEN is_premium THEN 1 ELSE 0 END) as "VIPs",
  SUM(CASE WHEN NOT is_premium THEN 1 ELSE 0 END) as "Free"
FROM public.users
GROUP BY role
ORDER BY role DESC;

-- ============================================
-- TODOS OS USUÁRIOS (resumo)
-- ============================================

SELECT 
  u.name as "Nome",
  au.email as "Email",
  u.role as "Tipo",
  CASE 
    WHEN u.is_premium THEN '👑 VIP'
    ELSE 'Free'
  END as "Status",
  TO_CHAR(u.created_at, 'DD/MM/YYYY HH24:MI') as "Cadastro"
FROM public.users u
LEFT JOIN auth.users au ON au.id = u.id
ORDER BY u.created_at DESC;
