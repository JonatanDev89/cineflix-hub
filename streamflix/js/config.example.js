// ============================================
// CINEFLIX HUB - CONFIGURATION (EXEMPLO)
// ============================================
// ⚠️ PARA DESENVOLVIMENTO LOCAL:
// 1. Copie este arquivo para config.js
// 2. Preencha com suas chaves reais
// 3. NUNCA commite o config.js com chaves reais!

const CONFIG = {
  // Supabase (chave pública - OK expor)
  SUPABASE_URL: 'https://seu-projeto.supabase.co',
  SUPABASE_ANON_KEY: 'sua_chave_anon_aqui',
  
  // TMDB API
  TMDB_API_KEY: 'sua_chave_tmdb_aqui',
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p',
  
  // App Settings
  APP_NAME: 'CineFlix Hub',
  APP_VERSION: '2.0.0',
};

// Exportar configuração
window.CONFIG = CONFIG;

console.log('✅ Configuração carregada');
