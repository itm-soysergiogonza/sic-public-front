#!/bin/bash
# build-and-push.sh
# Uso: ./build-and-push.sh dev|qa|prod

set -e

if [ -z "$1" ]; then
  echo "❌ Debes especificar un entorno: dev | qa | prod"
  exit 1
fi

ENV="$1"
IMAGE_NAME="pipecodebitech/sic-public-front"
LOCAL_TAG="sic-public-front:${ENV}"
REMOTE_TAG="${IMAGE_NAME}:${ENV}"

echo "🔧 Generando build Angular con configuración '$ENV'..."
npm run build -- --configuration=$ENV

echo "🔧 Generando build Docker con configuración '$ENV'..."
docker build --platform=linux/amd64 --build-arg CONFIGURATION=$ENV -t $LOCAL_TAG .

echo "🏷  Etiquetando imagen como '$REMOTE_TAG'..."
docker tag $LOCAL_TAG $REMOTE_TAG

echo "📤 Subiendo imagen a Docker Hub..."
docker push $REMOTE_TAG

echo "✅ Imagen subida correctamente: $REMOTE_TAG"