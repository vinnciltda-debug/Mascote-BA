@echo off
setlocal
title BA Mascote - Abrir Jogo
cd /d "%~dp0"
set "GAME_DIR=%~dp0ba-mascote-phaser"

if not exist "%GAME_DIR%\package.json" (
  echo [ERRO] Pasta do jogo nao encontrada:
  echo %GAME_DIR%
  echo.
  pause
  exit /b 1
)

cd /d "%GAME_DIR%"

echo ========================================
echo   BA Mascote - Inicializador do Jogo
echo ========================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERRO] NPM nao encontrado.
  echo Instale Node.js (LTS) e tente novamente:
  echo https://nodejs.org/
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao instalar dependencias.
    pause
    exit /b 1
  )
)

echo Abrindo o jogo em http://localhost:5173
start "" "http://localhost:5173"
echo.
echo Servidor em execucao. Nao feche esta janela enquanto joga.
echo.
call npm run dev -- --host 0.0.0.0 --port 5173
if errorlevel 1 (
  echo.
  echo [ERRO] Falha ao iniciar o servidor do jogo.
  pause
  exit /b 1
)

endlocal
