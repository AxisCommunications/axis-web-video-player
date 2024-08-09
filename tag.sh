#!/usr/bin/env bash

set -e -o pipefail

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [[ "$CURRENT_BRANCH" != main && "$CURRENT_BRANCH" != release-* ]] ; then
    echo "error: It's only allowed to tag on main or a release branch."
    exit 1
fi

TAG_VERSION=`sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' package.json`

git tag "$TAG_VERSION"
echo "Created tag $TAG_VERSION"
