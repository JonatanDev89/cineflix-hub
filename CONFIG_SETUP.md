# 🔧 Configuração de Variáveis de Ambiente

## 📋 Visão Geral

O CineFlix Hub usa variáveis de ambiente para proteger chaves sensíveis. O arquivo `config.js` é **gerado automaticamente** no build.

## 🏠 Desenvolvimento Local

### 1. Criar arquivo de configuração

```bash
# Copiar o exemplo
cp streamflix/js/config.example.js streamflix/js/config.js
```

### 2. Preencher com suas chaves

Edite `streamflix/js/config.js` e adicione suas chaves reais:

```javascript
const CONFIG = {
  SUPABASE_URL: 'https://seu-projeto.supabase.co',
  SUPABASE_ANON_KEY: 'sua_chave_anon_aqui',
  TMDB_API_KEY: 'sua_chave_tmdb_aqui',
  // ...
};
```

### 3. Obter as chaves

- **Supabase:** https://supabase.com/dashboard → Seu Projeto → Settings → API
- **TMDB:** https://www.themoviedb.org/settings/api

⚠️ **IMPORTANTE:** O arquivo `config.js` está no `.gitignore` e **nunca** será commitado!

## ☁️ Deploy no Render

### 1. Configurar variáveis de ambiente

No Render Dashboard:

1. Acesse seu Web Service
2. Vá em **Environment**
3. Adicione as variáveis:

```
SUPABASE_URL=sua_url_do_supabase_aqui
SUPABASE_ANON_KEY=sua_chave_anon_aqui
TMDB_API_KEY=sua_chave_tmdb_aqui
APP_NAME=CineFlix Hub
APP_VERSION=2.0.0
```

### 2. Configurar Build Command

No Render, configure o **Build Command**:

```bash
node generate_config.js && npm install
```

Ou se não usar npm:

```bash
node generate_config.js
```

### 3. Deploy

O Render irá:
1. Executar `generate_config.js`
2. Gerar `streamflix/js/config.js` com as variáveis de ambiente
3. Fazer o deploy do site

## 🔄 Fluxo de Trabalho

### Desenvolvimento Local
```
.env (suas chaves) → config.js (gerado manualmente)
```

### Produção (Render)
```
Environment Variables → generate_config.js → config.js (gerado automaticamente)
```

## 🛡️ Segurança

✅ **O que é seguro:**
- `config.example.js` - Sem chaves reais
- `.env.example` - Sem chaves reais
- `generate_config.js` - Script de geração

❌ **O que NUNCA commitar:**
- `config.js` - Contém chaves reais
- `.env` - Contém chaves reais

## 🧪 Testar Localmente

1. Copie o exemplo:
```bash
cp streamflix/js/config.example.js streamflix/js/config.js
```

2. Preencha suas chaves

3. Abra `streamflix/index.html` no navegador

4. Verifique no console:
```
✅ Configuração carregada
```

## 🚨 Troubleshooting

### Erro: "CONFIG is not defined"

**Causa:** Arquivo `config.js` não existe

**Solução:**
```bash
cp streamflix/js/config.example.js streamflix/js/config.js
# Edite e adicione suas chaves
```

### Erro no Render: "Variáveis de ambiente faltando"

**Causa:** Variáveis não configuradas no Render

**Solução:**
1. Render Dashboard → Environment
2. Adicione todas as variáveis necessárias
3. Faça redeploy

## 📞 Suporte

Dúvidas? Abra uma issue ou contate: marlonott75@gmail.com
