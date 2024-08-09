#!/bin/bash
root_path=$(git rev-parse --show-toplevel)

cd "$root_path" || exit

npm ci
npm run build

# Generate API documentation
npx api-extractor run
npx api-documenter markdown --input-folder generated --output-folder docs/api
