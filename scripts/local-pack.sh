#!/bin/bash
root_path=$(git rev-parse --show-toplevel)

cd "$root_path/sdk" || exit

npm ci

rm -rf ./dist
rm -rf ./package

LOCAL_PACK=true npm run build

mv ./node_modules/@lkp-rnd/webrtcvideo/webrtcvideo_bg.wasm ./dist

npx api-extractor run

npx api-documenter markdown --input-folder generated --output-folder docs/sdk

mkdir ./package
cp -r ./dist ./package

cp README.md ./package
cp package.json ./package
mkdir ./package/docs
cp docs/code-examples.md ./package/docs
mkdir ./package/docs/dpop
cp docs/dpop/customDPoP.jpg ./package/docs/dpop
cp -r docs/sdk ./package/docs/sdk

sed -i '/@lkp-rnd\/webrtcvideo/d' ./package/package.json

version=$(jq -r '.version' package.json)

tar -cvzf "axiscommunications-vaas-sdk-$version.tgz" package