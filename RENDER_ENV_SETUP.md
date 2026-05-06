# 🔐 Configurar Variáveis de Ambiente na Render

## 📋 Passo a Passo:

### 1️⃣ Acessar o Dashboard da Render

1. Vá em: https://dashboard.render.com/
2. Clique no seu serviço **"cineflix-hub"**

---

### 2️⃣ Ir para Environment

1. No menu lateral esquerdo, clique em **"Environment"**
2. Você verá uma lista de variáveis de ambiente

---

### 3️⃣ Adicionar Variáveis

Clique em **"Add Environment Variable"** e adicione cada uma:

#### ✅ Supabase URL
- **Key**: `SUPABASE_URL`
- **Value**: `https://lynltvzimbqltpafunmu.supabase.co`

#### ✅ Supabase Anon Key
- **Key**: `SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5bmx0dnppbWJxbHRwYWZ1bm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMzE2MzIsImV4cCI6MjA5MzYwNzYzMn0.XuF30WIDCYKtC9gD7ZNc03LqMNvw9o0Ujp7ptlxqk30`

#### ✅ TMDB API Key (opcional)
- **Key**: `TMDB_API_KEY`
- **Value**: `15d2ea6d0dc1d476efbca3eba2b9bbfb`

#### ✅ Mercado Pago Token (opcional)
- **Key**: `MP_TOKEN`
- **Value**: `APP_USR-8056159904642779-121712-97635788558ef7b14683ec3b2a3b4e20-1076799609`

---

### 4️⃣ Salvar

1. Clique em **"Save Changes"**
2. A Render vai fazer **redeploy automático**
3. Aguarde 2-3 minutos

---

## 🔒 Segurança:

✅ **Nunca commite** o arquivo `.env` no Git (já está no `.gitignore`)  
✅ **Use variáveis de ambiente** na Render para produção  
✅ **Mantenha as chaves secretas** seguras  
✅ **Não compartilhe** as chaves publicamente  

---

## 📝 Nota:

Por enquanto, as chaves estão **hardcoded** no `config.js` como fallback. Isso funciona, mas o ideal é:

1. **Desenvolvimento local**: usar `.env` (não commitado)
2. **Produção (Render)**: usar Environment Variables

---

## ✅ Verificar se Funcionou:

Após o redeploy, acesse:
```
https://cineflix-hub.onrender.com
```

Abra o **Console do navegador** (F12) e veja se aparece:
```
✅ Configuração carregada
✅ Supabase Client inicializado
```

---

**Pronto! Suas variáveis de ambiente estão configuradas!** 🎉
