@echo off
echo ========================================
echo   CineFlix Hub - Servidor Local
echo ========================================
echo.
echo Iniciando servidor na porta 8000...
echo.
echo Acesse: http://localhost:8000/streamflix/
echo.
echo Pressione Ctrl+C para parar o servidor
echo ========================================
echo.

cd streamflix
python -m http.server 8000

pause
