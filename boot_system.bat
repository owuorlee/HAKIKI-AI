@echo off
title HAKIKI AI SYSTEMS CONTROLLER
color 0A

echo ===============================================================================
echo.
echo    H A K I K I   A I   -   S O V E R E I G N   S Y S T E M S
echo.
echo    [v2.0] Integrity Restoration Engine
echo    (c) 2026 Ministry of Public Service / Sovereign Devs
echo.
echo ===============================================================================
echo.
echo    [SYSTEM] Initializing Boot Sequence...
echo.

:: 1. LAUNCH SOVEREIGN BRAIN (OLLAMA)
echo    [1/3] Engaging Neural Engine (Ollama)...
start "SOVEREIGN BRAIN" cmd /k "ollama serve"
timeout /t 3 /nobreak >nul

:: 2. LAUNCH AUDIT BACKEND
echo    [2/3] Powering Audit Engine (FastAPI)...
cd hakiki-v2-sovereign\backend
start "AUDIT ENGINE" cmd /k "uvicorn main:app --reload --host 0.0.0.0 --port 8000"
cd ..\..
timeout /t 5 /nobreak >nul

:: 3. LAUNCH COMMAND CENTER (FRONTEND)
echo    [3/3] Initializing Command Center UI (Next.js)...
cd hakiki-command-center
start "COMMAND CENTER" cmd /k "npm run dev"
cd ..

echo.
echo ===============================================================================
echo    SYSTEM ONLINE.
echo    Access Dashboard at: http://localhost:3000
echo ===============================================================================
echo.
pause
