@echo off
setlocal
cd /d "%~dp0"
if not exist ".github" mkdir ".github"
if not exist ".github\workflows" mkdir ".github\workflows"
copy /Y "GITHUB_WORKFLOW_VISIBLE\deploy.yml" ".github\workflows\deploy.yml" >nul
if exist ".github\workflows\deploy.yml" (
  echo OK: Se creo .github\workflows\deploy.yml correctamente.
  echo Ahora sube el proyecto usando GitHub Desktop o Git CLI.
) else (
  echo ERROR: No se pudo crear .github\workflows\deploy.yml
)
pause
