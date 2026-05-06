@echo off
chcp 65001 >nul
cls

echo 🎬 CineFlix Hub - Setup Git e GitHub
echo ====================================
echo.

REM Verificar se git está instalado
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git não está instalado. Instale em: https://git-scm.com/
    pause
    exit /b 1
)

REM Configurar usuário Git
echo 📝 Configurando Git...
set /p git_name="Digite seu nome: "
set /p git_email="Digite seu email: "

git config --global user.name "%git_name%"
git config --global user.email "%git_email%"

echo ✅ Git configurado!
echo.

REM Inicializar repositório
echo 📦 Inicializando repositório...
git init
git add .
git commit -m "Initial commit: CineFlix Hub - Plataforma de streaming completa"

echo ✅ Repositório criado!
echo.

REM Instruções para GitHub
echo 🌐 Próximos passos:
echo.
echo 1. Crie um repositório no GitHub:
echo    https://github.com/new
echo.
echo 2. Execute os comandos abaixo (substitua SEU-USUARIO):
echo.
echo    git remote add origin https://github.com/SEU-USUARIO/cineflix-hub.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Depois, faça deploy na Render:
echo    https://dashboard.render.com/
echo.
echo 📖 Veja o guia completo em DEPLOY_GUIDE.md
echo.
echo ✨ Pronto para subir para o GitHub!
echo.
pause
