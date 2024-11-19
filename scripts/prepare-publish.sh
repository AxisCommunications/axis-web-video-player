#!/bin/bash
root_path=$(git rev-parse --show-toplevel)

cd "$root_path" || exit

npm ci

rm -rf ./dist

# Build
npm run build

# Create SBOM
npx --yes @cyclonedx/cyclonedx-npm@latest \
    --output-format JSON \
    --output-file ./dist/VaaS-video-player_sbom.cyclonedx.json \
    --omit dev
