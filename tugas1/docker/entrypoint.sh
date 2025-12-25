#!/bin/sh
set -e

cd /app

# Ensure .env exists
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
  else
    touch .env
  fi
fi

# Ensure SQLite database file exists
mkdir -p /app/database
if [ ! -f /app/database/database.sqlite ]; then
  touch /app/database/database.sqlite
fi

# Generate APP_KEY if missing/empty
APP_KEY_LINE=$(grep -E '^APP_KEY=' .env || true)
APP_KEY_VALUE=$(printf "%s" "$APP_KEY_LINE" | cut -d= -f2-)
if [ -z "$APP_KEY_VALUE" ]; then
  php artisan key:generate --force
fi

# Run migrations + seed (fresh) for demo/review
php artisan migrate:fresh --seed --force

# Start Laravel server
exec php artisan serve --host=0.0.0.0 --port=8000
