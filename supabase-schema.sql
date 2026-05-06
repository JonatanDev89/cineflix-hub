-- ============================================
-- CINEFLIX HUB - SUPABASE DATABASE SCHEMA
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: users (dados adicionais dos usuários)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_premium BOOLEAN DEFAULT FALSE,
  premium_since TIMESTAMP WITH TIME ZONE,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_premium ON public.users(is_premium);

-- ============================================
-- TABELA: profiles (perfis de visualização)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar INTEGER DEFAULT 0,
  pin TEXT,
  is_kids BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_user ON public.profiles(user_id);

-- ============================================
-- TABELA: premium_content (conteúdo premium)
-- ============================================
CREATE TABLE IF NOT EXISTS public.premium_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tmdb_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  release_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id),
  UNIQUE(tmdb_id, type)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_premium_tmdb ON public.premium_content(tmdb_id, type);
CREATE INDEX IF NOT EXISTS idx_premium_release ON public.premium_content(release_date);

-- ============================================
-- TABELA: watch_progress (progresso de visualização)
-- ============================================
CREATE TABLE IF NOT EXISTS public.watch_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('movie', 'tv', 'channel')),
  title TEXT NOT NULL,
  poster TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  duration INTEGER,
  current_position INTEGER,
  last_watched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, tmdb_id, type)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_progress_profile ON public.watch_progress(profile_id);
CREATE INDEX IF NOT EXISTS idx_progress_watched ON public.watch_progress(last_watched DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS: users
-- ============================================

-- Usuários podem ver apenas seus próprios dados
CREATE POLICY "Users can view own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Admins podem ver todos os usuários
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins podem atualizar qualquer usuário
CREATE POLICY "Admins can update any user"
  ON public.users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Permitir inserção ao criar conta (via trigger)
CREATE POLICY "Allow insert on signup"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- POLÍTICAS: profiles
-- ============================================

-- Usuários podem ver apenas seus próprios perfis
CREATE POLICY "Users can view own profiles"
  ON public.profiles FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Usuários podem criar perfis para si mesmos
CREATE POLICY "Users can create own profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Usuários podem atualizar seus próprios perfis
CREATE POLICY "Users can update own profiles"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Usuários podem deletar seus próprios perfis
CREATE POLICY "Users can delete own profiles"
  ON public.profiles FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- POLÍTICAS: premium_content
-- ============================================

-- Todos podem ver conteúdo premium (para verificar bloqueios)
CREATE POLICY "Anyone can view premium content"
  ON public.premium_content FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins podem gerenciar conteúdo premium
CREATE POLICY "Admins can manage premium content"
  ON public.premium_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS: watch_progress
-- ============================================

-- Usuários podem ver progresso dos seus perfis
CREATE POLICY "Users can view own progress"
  ON public.watch_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = profile_id AND user_id = auth.uid()
    )
  );

-- Usuários podem criar progresso para seus perfis
CREATE POLICY "Users can create own progress"
  ON public.watch_progress FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = profile_id AND user_id = auth.uid()
    )
  );

-- Usuários podem atualizar progresso dos seus perfis
CREATE POLICY "Users can update own progress"
  ON public.watch_progress FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = profile_id AND user_id = auth.uid()
    )
  );

-- Usuários podem deletar progresso dos seus perfis
CREATE POLICY "Users can delete own progress"
  ON public.watch_progress FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = profile_id AND user_id = auth.uid()
    )
  );

-- ============================================
-- TRIGGER: Criar perfil padrão ao registrar
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir dados do usuário na tabela users
  INSERT INTO public.users (id, name, role, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    'user',
    UPPER(SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'name', 'U'), 1, 1))
  );
  
  -- Criar perfil padrão
  INSERT INTO public.profiles (user_id, name, avatar, is_kids)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    0,
    FALSE
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função ao criar usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- FUNÇÃO: Criar primeiro admin
-- ============================================

CREATE OR REPLACE FUNCTION public.create_admin(
  admin_email TEXT,
  admin_password TEXT,
  admin_name TEXT
)
RETURNS JSON AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Criar usuário no auth.users (você precisa fazer isso via Supabase Dashboard ou API)
  -- Esta função apenas promove um usuário existente para admin
  
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = admin_email;
  
  IF new_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Usuário não encontrado. Crie a conta primeiro via signup.'
    );
  END IF;
  
  -- Atualizar para admin
  UPDATE public.users
  SET role = 'admin', is_premium = true
  WHERE id = new_user_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Usuário promovido para admin com sucesso!',
    'user_id', new_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Usuários com contagem de perfis
CREATE OR REPLACE VIEW public.users_with_profiles AS
SELECT 
  u.*,
  COUNT(p.id) as profile_count
FROM public.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
GROUP BY u.id;

-- View: Conteúdo premium ativo
CREATE OR REPLACE VIEW public.active_premium_content AS
SELECT *
FROM public.premium_content
WHERE release_date > NOW()
ORDER BY release_date ASC;

-- ============================================
-- DADOS INICIAIS (OPCIONAL)
-- ============================================

-- Você pode criar o primeiro admin manualmente aqui
-- Substitua os valores abaixo:

-- INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
-- VALUES ('marlonott75@gmail.com', crypt('admin123', gen_salt('bf')), NOW());

-- Ou use a função após criar a conta via signup:
-- SELECT public.create_admin('marlonott75@gmail.com', 'admin123', 'Jonatan Ott');

-- ============================================
-- FIM DO SCHEMA
-- ============================================

-- Verificar se tudo foi criado corretamente
SELECT 
  'Tables created' as status,
  COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users', 'profiles', 'premium_content', 'watch_progress');
