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
cp -r docs/sdk ./package/docs/sdk

# This is a two stage operation as -i without extension only works with GNU sed
# while -i '' which is the BSD equivalent does not work on Linux on the other hand
# Thus -i with an extension is the only portable way to do inplace replace
sed -i.bak '/@lkp-rnd\/webrtcvideo/d' ./package/package.json
rm ./package/package.json.bak

version=$(jq -r '.version' package.json)

tar -cvzf "axiscommunications-vaas-sdk-$version.tgz" package
