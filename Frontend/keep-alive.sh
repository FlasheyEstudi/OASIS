#!/bin/bash
cd /home/z/my-project
export NODE_OPTIONS="--max-old-space-size=512"
while true; do
  echo "[$(date)] Starting Next.js dev server..."
  node node_modules/.bin/next dev -p 3000 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Next.js exited with code $EXIT_CODE, restarting in 5s..."
  sleep 5
done
