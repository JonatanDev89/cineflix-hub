# 🚀 Quick Start - Deploy em 5 Minutos

## ⚡ Opção Rápida (Windows)

Clique duas vezes no arquivo `setup_git.bat` e siga as instruções!

## 📝 Opção Manual

### 1️⃣ Configure o Git (primeira vez)
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

### 2️⃣ Prepare o repositório
```bash
git init
git add .
git commit -m "Initial commit: CineFlix Hub"
```

### 3️⃣ Crie repositório no GitHub
- Acesse: https://github.com/new
- Nome: `cineflix-hub`
- **NÃO** marque "Initialize with README"
- Clique em "Create repository"

### 4️⃣ Envie para o GitHub
```bash
git remote add origin https://github.com/SEU-USUARIO/cineflix-hub.git
git branch -M main
git push -u origin main
```
> ⚠️ Substitua `SEU-USUARIO` pelo seu username do GitHub

### 5️⃣ Deploy na Render
1. Acesse: https://dashboard.render.com/
2. New + → Web Service
3. Conecte o repositório `cineflix-hub`
4. Clique em "Create Web Service"
5. Aguarde 2-5 minutos ⏳
6. **Pronto!** 🎉

---

## 🎯 Seu site estará em:
```
https://cineflix-hub.onrender.com
```

## 🔑 Credenciais de teste:
**Admin:** admin@cineflix.com / admin123  
**User:** user@cineflix.com / user123

---

## 📚 Mais informações:
- **Guia completo:** `DEPLOY_GUIDE.md`
- **Comandos prontos:** `COMANDOS_RAPIDOS.txt`
- **Documentação:** `README.md`

---

## 💡 Dica
O plano free da Render "dorme" após 15 min de inatividade.  
O primeiro acesso pode demorar 30-60 segundos para "acordar".

---

**Dúvidas?** Veja o arquivo `DEPLOY_GUIDE.md` para instruções detalhadas!
