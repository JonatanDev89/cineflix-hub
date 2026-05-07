#!/usr/bin/env node

// ============================================
// GERADOR DE CONFIG.JS A PARTIR DO .ENV
// ============================================
// Este script gera o arquivo config.js usando variáveis de ambiente
// Rode no build do Render: node generate_config.js

const fs = require('fs');
const path = require('path');

// Pegar variáveis de ambiente (Render injeta automaticamente)
const config = {
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  TMDB_API_KEY: process.env.TMDB_API_KEY || '',
  APP_NAME: process.env.APP_NAME || 'CineFlix Hub',
  APP_VERSION: process.env.APP_VERSION || '2.0.0',
};

// Validar variáveis obrigatórias
const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'TMDB_API_KEY'];
const missing = required.filter(key => !config[key]);

if (missing.length > 0) {
  console.error('❌ Variáveis de ambiente faltando:', missing.join(', '));
  console.error('Configure-as no Render Dashboard > Environment');
  process.exit(1);
}

// Gerar conteúdo do config.js
const configContent = `// ============================================
// CINEFLIX HUB - CONFIGURATION
// ============================================
// ⚠️ ARQUIVO GERADO AUTOMATICAMENTE - NÃO EDITAR
// Gerado em: ${new Date().toISOString()}

const CONFIG = {
  // Supabase (chave pública - OK expor)
  SUPABASE_URL: '${config.SUPABASE_URL}',
  SUPABASE_ANON_KEY: '${config.SUPABASE_ANON_KEY}',
  
  // TMDB API
  TMDB_API_KEY: '${config.TMDB_API_KEY}',
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p',
  
  // App Settings
  APP_NAME: '${config.APP_NAME}',
  APP_VERSION: '${config.APP_VERSION}',
};

// Exportar configuração
window.CONFIG = CONFIG;

console.log('✅ Configuração carregada');
`;

// Criar diretório se não existir
const configDir = path.join(__dirname, 'streamflix', 'js');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// Escrever arquivo
const configPath = path.join(configDir, 'config.js');
fs.writeFileSync(configPath, configContent, 'utf8');

console.log('✅ config.js gerado com sucesso!');
console.log('📍 Local:', configPath);
console.log('🔑 Variáveis carregadas:', Object.keys(config).join(', '));
