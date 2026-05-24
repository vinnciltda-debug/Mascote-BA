@echo off
setlocal
title BA Mascote - Versao Unica
cd /d "%~dp0"

echo ========================================
echo   BA Mascote - Versao Oficial (HTML)
echo ========================================
echo.

if not exist "index.html" (
  echo [ERRO] index.html nao encontrado na pasta atual.
  pause
  exit /b 1
)

echo Abrindo versao oficial do jogo...
start "" "%~dp0index.html"
echo.
echo O jogo foi aberto no navegador padrao.
echo.
timeout /t 2 >nul
endlocal
