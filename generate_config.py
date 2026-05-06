#!/usr/bin/env python3
"""
Gera config.js a partir de variáveis de ambiente
"""
import os

# Ler variáveis de ambiente
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://lynltvzimbqltpafunmu.supabase.co')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5bmx0dnppbWJxbHRwYWZ1bm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMzE2MzIsImV4cCI6MjA5MzYwNzYzMn0.XuF30WIDCYKtC9gD7ZNc03LqMNvw9o0Ujp7ptlxqk30')
TMDB_API_KEY = os.environ.get('TMDB_API_KEY', '15d2ea6d0dc1d476efbca3eba2b9bbfb')

# Gerar config.js
config_js = f"""// ============================================
// CINEFLIX HUB - CONFIGURATION
// ============================================
// Este arquivo é gerado automaticamente pelo generate_config.py

const CONFIG = {{
  // Supabase
  SUPABASE_URL: '{SUPABASE_URL}',
  SUPABASE_ANON_KEY: '{SUPABASE_ANON_KEY}',
  
  // TMDB API
  TMDB_API_KEY: '{TMDB_API_KEY}',
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p',
  
  // App Settings
  APP_NAME: 'CineFlix Hub',
  APP_VERSION: '2.0.0',
}};

// Exportar configuração
window.CONFIG = CONFIG;

console.log('✅ Configuração carregada');
"""

# Salvar arquivo
output_path = 'streamflix/js/config.js'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(config_js)

print(f'✅ {output_path} gerado com sucesso!')
print(f'   SUPABASE_URL: {SUPABASE_URL[:30]}...')
print(f'   TMDB_API_KEY: {TMDB_API_KEY[:20]}...')
