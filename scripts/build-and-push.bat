@echo off
REM build-and-push.bat
REM Uso: build-and-push.bat dev|qa|prod

if "%1"=="" (
  echo ❌ Debes especificar un entorno: dev ^| qa ^| prod
  exit /b 1
)

set ENV=%1
set IMAGE_NAME=pipecodebitech/sic-public-front
set LOCAL_TAG=sic-public-front:%ENV%
set REMOTE_TAG=%IMAGE_NAME%:%ENV%

echo 🔧 Generando build Angular con configuración '%ENV%'...
npm run build -- --configuration=$ENV

echo 🔧 Generando build Angular con configuración '%ENV%'...
docker build --build-arg CONFIGURATION=%ENV% -t %LOCAL_TAG% .

echo 🏷  Etiquetando imagen como '%REMOTE_TAG%'...
docker tag %LOCAL_TAG% %REMOTE_TAG%

echo 📤 Subiendo imagen a Docker Hub...
docker push %REMOTE_TAG%

echo ✅ Imagen subida correctamente: %REMOTE_TAG%
