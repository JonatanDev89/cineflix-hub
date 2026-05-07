@echo off
echo ========================================
echo   CineFlix Hub - Servidor Local (Node)
echo ========================================
echo.
echo Verificando se http-server está instalado...
echo.

where npx >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Node.js não está instalado!
    echo Instale em: https://nodejs.org/
    pause
    exit /b 1
)

echo Iniciando servidor na porta 8000...
echo.
echo Acesse: http://localhost:8000/streamflix/
echo.
echo Pressione Ctrl+C para parar o servidor
echo ========================================
echo.

npx http-server -p 8000 -c-1

pause
