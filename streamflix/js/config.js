// ============================================
// CINEFLIX HUB - CONFIGURATION
// ============================================

// Este arquivo será gerado automaticamente pela Render
// usando as variáveis de ambiente configuradas

const CONFIG = {
  // Supabase
  SUPABASE_URL: 'https://lynltvzimbqltpafunmu.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5bmx0dnppbWJxbHRwYWZ1bm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMzE2MzIsImV4cCI6MjA5MzYwNzYzMn0.XuF30WIDCYKtC9gD7ZNc03LqMNvw9o0Ujp7ptlxqk30',
  
  // TMDB API
  TMDB_API_KEY: '15d2ea6d0dc1d476efbca3eba2b9bbfb',
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p',
  
  // App Settings
  APP_NAME: 'CineFlix Hub',
  APP_VERSION: '2.0.0',
};

// Exportar configuração
window.CONFIG = CONFIG;

console.log('✅ Configuração carregada');
