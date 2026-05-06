// ============================================
// SUPABASE CLIENT - CINEFLIX HUB
// ============================================

const SUPABASE_URL = 'https://lynltvzimbqltpafunmu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5bmx0dnppbWJxbHRwYWZ1bm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMzE2MzIsImV4cCI6MjA5MzYwNzYzMn0.XuF30WIDCYKtC9gD7ZNc03LqMNvw9o0Ujp7ptlxqk30';

// Importar Supabase via CDN
const supabaseScript = document.createElement('script');
supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
supabaseScript.onload = () => {
  console.log('✅ Supabase carregado');
};
document.head.appendChild(supabaseScript);

// Cliente Supabase
let supabase = null;

// Inicializar quando o script carregar
window.addEventListener('load', () => {
  if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase Client inicializado');
  }
});

// ============================================
// AUTH SYSTEM COM SUPABASE
// ============================================

const SupabaseAuth = (() => {

  // Aguardar inicialização do Supabase
  async function waitForSupabase() {
    let attempts = 0;
    while (!supabase && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      }
      attempts++;
    }
    if (!supabase) throw new Error('Supabase não carregou');
    return supabase;
  }

  // ============================================
  // AUTENTICAÇÃO
  // ============================================

  async function register(name, email, password) {
    try {
      const sb = await waitForSupabase();
      
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) {
        console.error('Erro no registro:', error);
        return { 
          success: false, 
          message: error.message === 'User already registered' 
            ? 'Este e-mail já está cadastrado.' 
            : 'Erro ao criar conta: ' + error.message 
        };
      }

      return { 
        success: true, 
        message: 'Conta criada com sucesso! Verifique seu e-mail.',
        user: data.user
      };
    } catch (error) {
      console.error('Erro:', error);
      return { success: false, message: 'Erro ao conectar com o servidor.' };
    }
  }

  async function login(email, password, remember = false) {
    try {
      const sb = await waitForSupabase();

      const { data, error } = await sb.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Erro no login:', error);
        return { 
          success: false, 
          message: error.message === 'Invalid login credentials' 
            ? 'E-mail ou senha incorretos.' 
            : 'Erro ao fazer login: ' + error.message 
        };
      }

      // Buscar dados adicionais do usuário
      const { data: userData, error: userError } = await sb
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        console.error('Erro ao buscar dados do usuário:', userError);
      }

      const user = {
        id: data.user.id,
        email: data.user.email,
        name: userData?.name || data.user.user_metadata?.name || 'Usuário',
        role: userData?.role || 'user',
        avatar: userData?.avatar || 'U',
        isPremium: userData?.is_premium || false
      };

      // Salvar sessão localmente
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('sf_current_user', JSON.stringify(user));

      return { success: true, user };
    } catch (error) {
      console.error('Erro:', error);
      return { success: false, message: 'Erro ao conectar com o servidor.' };
    }
  }

  async function logout() {
    try {
      const sb = await waitForSupabase();
      await sb.auth.signOut();
      sessionStorage.removeItem('sf_current_user');
      localStorage.removeItem('sf_current_user');
      sessionStorage.removeItem('cf_profile');
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Limpar mesmo se der erro
      sessionStorage.clear();
      localStorage.removeItem('sf_current_user');
      window.location.href = 'index.html';
    }
  }

  async function getCurrentUser() {
    try {
      // Primeiro tenta pegar do cache
      const cached = sessionStorage.getItem('sf_current_user') || localStorage.getItem('sf_current_user');
      if (cached) {
        return JSON.parse(cached);
      }

      // Se não tem cache, verifica sessão do Supabase
      const sb = await waitForSupabase();
      const { data: { user } } = await sb.auth.getUser();
      
      if (!user) return null;

      // Buscar dados adicionais
      const { data: userData } = await sb
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      const currentUser = {
        id: user.id,
        email: user.email,
        name: userData?.name || user.user_metadata?.name || 'Usuário',
        role: userData?.role || 'user',
        avatar: userData?.avatar || 'U',
        isPremium: userData?.is_premium || false
      };

      sessionStorage.setItem('sf_current_user', JSON.stringify(currentUser));
      return currentUser;
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
  }

  async function requireAuth(redirectTo = 'index.html') {
    const user = await getCurrentUser();
    if (!user) {
      window.location.replace(redirectTo);
      return null;
    }
    return user;
  }

  async function requireAdmin(redirectTo = 'home.html') {
    const user = await getCurrentUser();
    if (!user) {
      window.location.replace('index.html');
      return null;
    }
    if (user.role !== 'admin') {
      window.location.replace(redirectTo);
      return null;
    }
    return user;
  }

  // ============================================
  // USUÁRIOS (ADMIN)
  // ============================================

  async function getAllUsers() {
    try {
      const sb = await waitForSupabase();
      const { data, error } = await sb
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  }

  async function updateUser(userId, updates) {
    try {
      const sb = await waitForSupabase();
      const { data, error } = await sb
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return { success: false, message: error.message };
    }
  }

  async function setPremium(userId, isPremium) {
    return updateUser(userId, {
      is_premium: isPremium,
      premium_since: isPremium ? new Date().toISOString() : null
    });
  }

  // ============================================
  // PERFIS
  // ============================================

  async function getProfiles(userId) {
    try {
      const sb = await waitForSupabase();
      const { data, error } = await sb
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
      return [];
    }
  }

  async function createProfile(userId, profileData) {
    try {
      const sb = await waitForSupabase();
      const { data, error } = await sb
        .from('profiles')
        .insert([{
          user_id: userId,
          ...profileData
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      return { success: false, message: error.message };
    }
  }

  async function updateProfile(profileId, updates) {
    try {
      const sb = await waitForSupabase();
      const { data, error } = await sb
        .from('profiles')
        .update(updates)
        .eq('id', profileId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, message: error.message };
    }
  }

  async function deleteProfile(profileId) {
    try {
      const sb = await waitForSupabase();
      const { error } = await sb
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar perfil:', error);
      return { success: false, message: error.message };
    }
  }

  function getCurrentProfile() {
    const data = sessionStorage.getItem('cf_profile');
    return data ? JSON.parse(data) : null;
  }

  function setCurrentProfile(profile) {
    sessionStorage.setItem('cf_profile', JSON.stringify(profile));
  }

  function clearProfile() {
    sessionStorage.removeItem('cf_profile');
  }

  // ============================================
  // CONTEÚDO PREMIUM
  // ============================================

  async function getPremiumContent() {
    try {
      const sb = await waitForSupabase();
      const { data, error } = await sb
        .from('premium_content')
        .select('*')
        .order('release_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar conteúdo premium:', error);
      return [];
    }
  }

  async function addPremiumContent(tmdbId, type, title, releaseDate) {
    try {
      const sb = await waitForSupabase();
      const user = await getCurrentUser();
      
      const { data, error } = await sb
        .from('premium_content')
        .insert([{
          tmdb_id: tmdbId,
          type: type,
          title: title,
          release_date: releaseDate,
          created_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao adicionar conteúdo premium:', error);
      return { success: false, message: error.message };
    }
  }

  async function removePremiumContent(id) {
    try {
      const sb = await waitForSupabase();
      const { error } = await sb
        .from('premium_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover conteúdo premium:', error);
      return { success: false, message: error.message };
    }
  }

  async function isContentPremiumLocked(tmdbId, type, userId) {
    try {
      // Se é VIP, nunca bloqueia
      const user = await getCurrentUser();
      if (user && user.isPremium) return false;

      const sb = await waitForSupabase();
      const { data, error } = await sb
        .from('premium_content')
        .select('release_date')
        .eq('tmdb_id', tmdbId)
        .eq('type', type)
        .single();

      if (error || !data) return false;

      const releaseDate = new Date(data.release_date);
      const now = new Date();

      if (now < releaseDate) {
        return { locked: true, releaseDate: data.release_date };
      }

      return false;
    } catch (error) {
      console.error('Erro ao verificar bloqueio:', error);
      return false;
    }
  }

  // ============================================
  // PROGRESSO DE VISUALIZAÇÃO
  // ============================================

  async function saveProgress(profileId, progressData) {
    try {
      const sb = await waitForSupabase();
      const { data, error } = await sb
        .from('watch_progress')
        .upsert([{
          profile_id: profileId,
          tmdb_id: progressData.id,
          type: progressData.type,
          title: progressData.title,
          poster: progressData.poster,
          progress: progressData.progress || 0,
          duration: progressData.duration,
          current_time: progressData.currentTime,
          last_watched: new Date().toISOString()
        }], {
          onConflict: 'profile_id,tmdb_id,type'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
      return { success: false, message: error.message };
    }
  }

  async function getProgress(profileId) {
    try {
      const sb = await waitForSupabase();
      const { data, error } = await sb
        .from('watch_progress')
        .select('*')
        .eq('profile_id', profileId)
        .order('last_watched', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      return [];
    }
  }

  async function removeProgress(profileId, tmdbId, type) {
    try {
      const sb = await waitForSupabase();
      const { error } = await sb
        .from('watch_progress')
        .delete()
        .eq('profile_id', profileId)
        .eq('tmdb_id', tmdbId)
        .eq('type', type);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover progresso:', error);
      return { success: false, message: error.message };
    }
  }

  // ============================================
  // RETORNO PÚBLICO
  // ============================================

  return {
    // Auth
    register,
    login,
    logout,
    getCurrentUser,
    requireAuth,
    requireAdmin,
    
    // Users
    getAllUsers,
    updateUser,
    setPremium,
    
    // Profiles
    getProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
    getCurrentProfile,
    setCurrentProfile,
    clearProfile,
    
    // Premium Content
    getPremiumContent,
    addPremiumContent,
    removePremiumContent,
    isContentPremiumLocked,
    
    // Watch Progress
    saveProgress,
    getProgress,
    removeProgress,
    
    // Supabase client direto (para casos avançados)
    getClient: () => supabase
  };
})();

// Exportar como Auth para compatibilidade
window.Auth = SupabaseAuth;

console.log('✅ Supabase Auth System carregado');
