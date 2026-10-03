#!/bin/sh
set -e
if [ ! -f /data/db.json ]; then
  cp /app/backend/db.json /data/db.json
fi
exec npx json-server /data/db.json --port 3001 --host 0.0.0.0
