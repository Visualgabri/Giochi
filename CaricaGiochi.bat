@echo off
REM === Configura percorso locale del repository ===
set REPO_PATH=C:\Repos\Giochi

REM === Messaggio di commit automatico con data ===
set MESSAGE=Aggiornamento automatico %DATE% %TIME%

REM === Vai nella cartella del repository ===
cd /d "%REPO_PATH%"

REM === Aggiungi file, commit e push su branch main ===
git add .
git commit -m "%MESSAGE%"
git push origin main

echo --------------------------------------------
echo Repository caricato su GitHub con successo
echo --------------------------------------------
