@echo off
title LAN File Storage - Production Server
echo ===================================================
echo Starting LAN File Storage in Production Mode...
echo ===================================================

echo [1/2] Building frontend client assets...
call npm run build

echo [2/2] Launching unified Storage Server on port 3000...
node server/src/index.js
pause
