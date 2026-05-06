# 🚀 Guia de Deploy - CineFlix Hub

## Passo 1: Configurar Git (Primeira vez)

Abra o terminal e configure seu nome e email:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

## Passo 2: Criar Repositório no GitHub

1. Acesse [GitHub](https://github.com)
2. Clique em **"New repository"** (botão verde)
3. Configure:
   - **Repository name**: `cineflix-hub` (ou o nome que preferir)
   - **Description**: "Plataforma de streaming de filmes e séries"
   - **Visibility**: Public ou Private
   - ⚠️ **NÃO** marque "Initialize with README" (já temos um)
4. Clique em **"Create repository"**

## Passo 3: Subir o Código para o GitHub

No terminal, execute os seguintes comandos na pasta do projeto:

```bash
# Adicionar todos os arquivos
git add .

# Criar o primeiro commit
git commit -m "Initial commit: CineFlix Hub - Plataforma de streaming completa"

# Adicionar o repositório remoto (substitua SEU-USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU-USUARIO/cineflix-hub.git

# Renomear branch para main (se necessário)
git branch -M main

# Enviar para o GitHub
git push -u origin main
```

**Nota**: Quando pedir usuário e senha, use seu username do GitHub e um **Personal Access Token** (não a senha normal).

### Como criar um Personal Access Token:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → Marque "repo" → Generate token
3. Copie o token e use como senha no git push

## Passo 4: Deploy na Render

### 4.1 Criar Conta na Render
1. Acesse [Render](https://render.com)
2. Clique em **"Get Started"** ou **"Sign Up"**
3. Conecte com sua conta do GitHub

### 4.2 Criar Web Service
1. No dashboard da Render, clique em **"New +"** → **"Web Service"**
2. Clique em **"Connect account"** para conectar o GitHub (se ainda não conectou)
3. Encontre o repositório **cineflix-hub** e clique em **"Connect"**

### 4.3 Configurar o Serviço
A Render detectará automaticamente o arquivo `render.yaml`, mas você pode verificar:

- **Name**: `cineflix-hub` (ou outro nome)
- **Region**: Oregon (ou mais próximo de você)
- **Branch**: `main`
- **Runtime**: Python 3
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python streamflix/proxy.py`
- **Plan**: Free

### 4.4 Variáveis de Ambiente (Opcional)
Se quiser configurar variáveis de ambiente:
1. Na página do serviço, vá em **"Environment"**
2. Adicione:
   - `PORT`: 3000 (já configurado automaticamente)
   - `MP_TOKEN`: Seu token do Mercado Pago (se quiser mudar)

### 4.5 Deploy
1. Clique em **"Create Web Service"**
2. Aguarde o deploy (leva 2-5 minutos)
3. Quando aparecer "Live", seu site está no ar! 🎉

## Passo 5: Acessar seu Site

Após o deploy, você receberá uma URL como:
```
https://cineflix-hub.onrender.com
```

## 🔧 Configurações Importantes

### API do TMDB
1. Crie conta em [TMDB](https://www.themoviedb.org/)
2. Obtenha API Key em Settings → API
3. Edite `streamflix/js/tmdb.js` e substitua a chave
4. Faça commit e push:
```bash
git add streamflix/js/tmdb.js
git commit -m "Atualizar API key do TMDB"
git push
```

### Mercado Pago
1. Crie conta em [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Obtenha Access Token de produção
3. Edite `streamflix/proxy.py` e substitua `MP_TOKEN`
4. Faça commit e push:
```bash
git add streamflix/proxy.py
git commit -m "Atualizar token do Mercado Pago"
git push
```

## 🔄 Atualizações Futuras

Sempre que fizer alterações no código:

```bash
git add .
git commit -m "Descrição das alterações"
git push
```

A Render fará deploy automático das mudanças!

## 📱 Credenciais de Teste

**Admin:**
- Email: admin@cineflix.com
- Senha: admin123

**Usuário:**
- Email: user@cineflix.com
- Senha: user123

## ⚠️ Notas Importantes

1. **Plano Free da Render**: O serviço "dorme" após 15 minutos de inatividade. O primeiro acesso pode demorar 30-60 segundos.

2. **Domínio Customizado**: No plano pago da Render, você pode adicionar seu próprio domínio.

3. **HTTPS**: A Render fornece HTTPS automaticamente.

4. **Logs**: Acesse os logs em tempo real no dashboard da Render.

## 🆘 Problemas Comuns

### "Build failed"
- Verifique se `requirements.txt` e `runtime.txt` estão corretos
- Veja os logs de build na Render

### "Application failed to respond"
- Verifique se o servidor está rodando na porta correta (variável PORT)
- Veja os logs de runtime na Render

### Site não carrega CSS/JS
- Verifique os caminhos dos arquivos
- Certifique-se que todos os arquivos foram commitados

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs na Render
2. Teste localmente primeiro: `python streamflix/proxy.py`
3. Consulte a [documentação da Render](https://render.com/docs)

---

✅ **Pronto!** Seu CineFlix Hub estará online e acessível para o mundo todo! 🌍
