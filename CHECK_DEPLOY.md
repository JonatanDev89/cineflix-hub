# ✅ Checklist de Deploy - CineFlix Hub

Use este checklist para garantir que tudo está pronto para o deploy!

## 📋 Antes de Começar

- [ ] Git instalado no computador
- [ ] Conta no GitHub criada
- [ ] Conta na Render criada (ou criar durante o processo)

## 🔧 Arquivos Necessários (Já Criados ✅)

- [x] `README.md` - Documentação do projeto
- [x] `render.yaml` - Configuração automática da Render
- [x] `requirements.txt` - Dependências Python
- [x] `runtime.txt` - Versão do Python
- [x] `.gitignore` - Arquivos a ignorar no Git
- [x] `streamflix/proxy.py` - Servidor configurado para Render

## 📝 Passo a Passo

### ✅ Etapa 1: Configurar Git
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```
- [ ] Git configurado com nome
- [ ] Git configurado com email

### ✅ Etapa 2: Inicializar Repositório
```bash
git init
git add .
git commit -m "Initial commit: CineFlix Hub"
```
- [ ] Repositório inicializado
- [ ] Arquivos adicionados
- [ ] Primeiro commit criado

### ✅ Etapa 3: GitHub
1. Criar repositório em https://github.com/new
   - [ ] Nome: `cineflix-hub`
   - [ ] **NÃO** marcar "Initialize with README"
   - [ ] Repositório criado

2. Conectar e enviar código:
```bash
git remote add origin https://github.com/SEU-USUARIO/cineflix-hub.git
git branch -M main
git push -u origin main
```
- [ ] Remote adicionado
- [ ] Branch renomeada para main
- [ ] Código enviado para GitHub

### ✅ Etapa 4: Deploy na Render
1. Acessar https://dashboard.render.com/
   - [ ] Conta criada/logada
   - [ ] GitHub conectado

2. Criar Web Service
   - [ ] Clicar em "New +" → "Web Service"
   - [ ] Repositório `cineflix-hub` selecionado
   - [ ] Configurações verificadas:
     - [ ] Name: cineflix-hub
     - [ ] Environment: Python 3
     - [ ] Build Command: `pip install -r requirements.txt`
     - [ ] Start Command: `python streamflix/proxy.py`
     - [ ] Plan: Free
   - [ ] "Create Web Service" clicado

3. Aguardar Deploy
   - [ ] Build iniciado
   - [ ] Build concluído (verde)
   - [ ] Status: "Live" 🟢

### ✅ Etapa 5: Testar
- [ ] Acessar URL fornecida pela Render
- [ ] Página de login carrega corretamente
- [ ] Login funciona (admin@cineflix.com / admin123)
- [ ] Dashboard admin acessível
- [ ] Catálogo de filmes carrega

## 🔍 Verificações Adicionais

### Arquivos do Projeto
- [ ] Todos os arquivos HTML estão na pasta `streamflix/`
- [ ] Pasta `css/` com todos os estilos
- [ ] Pasta `js/` com todos os scripts
- [ ] Arquivo `proxy.py` configurado

### Configurações Opcionais
- [ ] API Key do TMDB configurada (opcional)
- [ ] Token do Mercado Pago configurado (opcional)

## 🎯 Resultado Final

Após completar todos os itens acima, você terá:

✅ Código no GitHub  
✅ Site online na Render  
✅ URL pública funcionando  
✅ Sistema completo operacional  

**URL do seu site:**
```
https://cineflix-hub.onrender.com
```
(ou o nome que você escolheu)

## 🆘 Se Algo Der Errado

### Build Failed
1. Verifique os logs na Render
2. Confirme que `requirements.txt` existe
3. Confirme que `runtime.txt` tem `python-3.11.0`

### Application Failed to Respond
1. Verifique os logs de runtime na Render
2. Confirme que `proxy.py` está usando `PORT` do ambiente
3. Confirme que o servidor está em `0.0.0.0`

### Site Não Carrega
1. Aguarde 30-60 segundos (plano free "acorda" devagar)
2. Verifique se o status está "Live" na Render
3. Tente acessar em modo anônimo/privado

### CSS/JS Não Carrega
1. Verifique os caminhos dos arquivos
2. Confirme que todos os arquivos foram commitados
3. Veja o console do navegador (F12) para erros

## 📞 Recursos de Ajuda

- **Guia Completo:** `DEPLOY_GUIDE.md`
- **Comandos Prontos:** `COMANDOS_RAPIDOS.txt`
- **Quick Start:** `QUICK_START.md`
- **Documentação Render:** https://render.com/docs
- **Documentação Git:** https://git-scm.com/doc

---

## 🎉 Parabéns!

Se você marcou todos os itens acima, seu **CineFlix Hub** está online e funcionando! 🚀

Compartilhe a URL com seus amigos e aproveite! 🎬🍿

---

**Última atualização:** 2026-05-06
