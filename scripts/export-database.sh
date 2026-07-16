#!/usr/bin/env bash
# Dump the entire Postgres database (schema + data) to stdout as plain SQL.
# Usage:  ./scripts/export-database.sh > database/saveur-seed.sql
#
# Set DATABASE_URL to your Postgres connection string, e.g.
#   export DATABASE_URL="postgres://postgres:postgres@localhost:54322/postgres"
#
# For local Supabase:
#   export DATABASE_URL="$(supabase status -o env | awk -F= '/DB_URL/{print $2}' | tr -d '\"')"

set -euo pipefail

: "${DATABASE_URL:?Set DATABASE_URL to your Postgres connection string}"

pg_dump \
  --dbname="$DATABASE_URL" \
  --no-owner \
  --no-privileges \
  --schema=public \
  --schema=auth \
  --clean --if-exists \
  --format=plain
