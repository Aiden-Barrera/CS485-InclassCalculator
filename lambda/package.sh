#!/bin/sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
LAMBDA_DIR="$ROOT_DIR/lambda"
BUILD_DIR="$LAMBDA_DIR/dist"
ZIP_PATH="$LAMBDA_DIR/calculate-lambda.zip"

rm -rf "$BUILD_DIR" "$ZIP_PATH"
mkdir -p "$BUILD_DIR"

cp "$LAMBDA_DIR/index.mjs" "$BUILD_DIR/index.mjs"
cp "$ROOT_DIR/shared/calculate.mjs" "$BUILD_DIR/calculate.mjs"
sed -i.bak 's#..\/shared\/calculate.mjs#./calculate.mjs#' "$BUILD_DIR/index.mjs"
rm "$BUILD_DIR/index.mjs.bak"

(
  cd "$BUILD_DIR"
  zip -q -r "$ZIP_PATH" index.mjs calculate.mjs
)

printf 'Created %s\n' "$ZIP_PATH"
