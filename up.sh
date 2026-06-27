#!/usr/bin/env bash
docker compose up -d "$@" && {
  echo ""
  echo "  ✅ DevCollab is running!"
  echo "     Client:  http://localhost:8080"
  echo "     Server:  http://localhost:5000 (internal)"
  echo ""
}
