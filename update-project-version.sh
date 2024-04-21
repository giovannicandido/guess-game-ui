#!/usr/bin/env bash

if [[ -z $1 ]]; then
    echo "Version is mandatory"
    exit 1
fi

PROJECT_VERSION=$1

tmp=$(mktemp)
jq --arg PROJECT_VERSION "${PROJECT_VERSION}" '.version = $PROJECT_VERSION' package.json > "$tmp" && mv "$tmp" package.json
