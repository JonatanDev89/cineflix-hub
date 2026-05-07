# 🔒 Segurança - CineFlix Hub

## Chaves e Credenciais

### ✅ Chaves Públicas (OK expor no frontend)

**Supabase Anon Key:**
- É **segura** para expor no frontend
- Protegida por Row Level Security (RLS) no banco de dados
- Não permite acesso direto aos dados sem autenticação
- Localização: `streamflix/js/config.js`

### ⚠️ Chaves Privadas (NUNCA expor)

**TMDB API Key:**
- ❌ **NÃO deve** estar no frontend
- Pode ser abusada para fazer requisições em seu nome
- **Solução atual:** Exposta no `config.js` (PRECISA SER CORRIGIDA)
- **Solução recomendada:** Criar proxy backend

**Mercado Pago Token:**
- ❌ **NUNCA** expor no frontend
- Permite criar cobranças e acessar dados financeiros
- Deve estar apenas no backend (`.env`)

## 🛡️ Boas Práticas Implementadas

1. **`.env` no `.gitignore`**
   - Arquivo `.env` nunca é commitado
   - Apenas `.env.example` (sem chaves reais) vai pro Git

2. **Row Level Security (RLS)**
   - Todas as tabelas do Supabase têm RLS ativado
   - Usuários só acessam seus próprios dados

3. **Autenticação JWT**
   - Tokens seguros gerenciados pelo Supabase
   - Expiração automática de sessões

## 🚨 Problemas Atuais

### TMDB API Key Exposta

**Problema:**
```javascript
// streamflix/js/config.js
TMDB_API_KEY: '15d2ea6d0dc1d476efbca3eba2b9bbfb', // ❌ EXPOSTO
```

**Solução Recomendada:**

1. **Criar proxy backend** (Python/Node.js)
2. **Mover a chave para variável de ambiente**
3. **Frontend faz requisições para o proxy**

```javascript
// Exemplo de proxy
// backend/api/tmdb.js
app.get('/api/tmdb/*', async (req, res) => {
  const tmdbPath = req.params[0];
  const response = await fetch(
    `https://api.themoviedb.org/3/${tmdbPath}?api_key=${process.env.TMDB_API_KEY}`
  );
  const data = await response.json();
  res.json(data);
});
```

## 📋 Checklist de Segurança

- [x] `.env` no `.gitignore`
- [x] `.env.example` sem chaves reais
- [x] Supabase RLS ativado
- [x] Autenticação JWT
- [ ] TMDB API Key protegida (PENDENTE)
- [x] Mercado Pago Token no backend
- [ ] Rate limiting nas APIs
- [ ] HTTPS obrigatório em produção

## 🔄 Rotação de Chaves

Se alguma chave foi exposta:

1. **TMDB:** Regenerar em https://www.themoviedb.org/settings/api
2. **Mercado Pago:** Regenerar em https://www.mercadopago.com.br/developers
3. **Supabase:** Regenerar no dashboard (se necessário)

## 📞 Contato

Se encontrar vulnerabilidades, reporte para: marlonott75@gmail.com
