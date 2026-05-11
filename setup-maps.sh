#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# setup-maps.sh — Download Nicaragua OSM data and start GraphHopper
# ─────────────────────────────────────────────────────────────────────────────
# Usage: bash setup-maps.sh
# Requires: curl or wget, docker
# ─────────────────────────────────────────────────────────────────────────────

set -e

MAPS_DIR="$(dirname "$0")/maps"
MAP_FILE="$MAPS_DIR/nicaragua-latest.osm.pbf"
GEOFABRIK_URL="https://download.geofabrik.de/central-america/nicaragua-latest.osm.pbf"

echo "🌿 Oasis - GraphHopper Setup Script"
echo "──────────────────────────────────────"

# Create maps directory if it doesn't exist
mkdir -p "$MAPS_DIR"

# Download Nicaragua OSM data from Geofabrik if not present
if [ ! -f "$MAP_FILE" ]; then
  echo "📥 Downloading Nicaragua OSM data from Geofabrik (~50MB)..."
  if command -v wget &>/dev/null; then
    wget -O "$MAP_FILE" "$GEOFABRIK_URL"
  elif command -v curl &>/dev/null; then
    curl -L -o "$MAP_FILE" "$GEOFABRIK_URL"
  else
    echo "❌ Error: curl or wget required. Install one and retry."
    exit 1
  fi
  echo "✅ Download complete: $MAP_FILE"
else
  echo "✅ OSM data already present: $MAP_FILE"
fi

# Start GraphHopper using Docker
echo ""
echo "🚀 Starting GraphHopper (first run may take 2-5 minutes to index OSM data)..."
docker run -d \
  --name oasis-graphhopper \
  --restart unless-stopped \
  -v "$MAPS_DIR":/data \
  -p 8989:8989 \
  graphhopper/graphhopper:latest

echo ""
echo "⏳ Waiting for GraphHopper to initialize..."
sleep 10

# Wait up to 5 minutes for GraphHopper to become ready
MAX_WAIT=300
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
  if curl -sf http://localhost:8989/health &>/dev/null; then
    echo ""
    echo "✅ GraphHopper is ready!"
    echo ""
    echo "🧪 Running test route: Rotonda El Periodista → Plaza Inter (Managua)"
    curl -s "http://localhost:8989/route?point=12.1142,-86.2713&point=12.1245,-86.2660&vehicle=motorcycle" \
      | python3 -c "import sys, json; r=json.load(sys.stdin); print(f'  Distance: {r[\"paths\"][0][\"distance\"]/1000:.2f} km')" \
      2>/dev/null || echo "  (python3 not available for parsing - route server is live)"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "GraphHopper UI: http://localhost:8989"
    echo "Route API:      http://localhost:8989/route"
    echo ""
    echo "Next step: add GRAPHHOPPER_URL=http://localhost:8989 to Backend/.env"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 0
  fi
  printf "."
  sleep 5
  ELAPSED=$((ELAPSED + 5))
done

echo ""
echo "⚠️  GraphHopper took too long to start. Check logs with: docker logs oasis-graphhopper"
