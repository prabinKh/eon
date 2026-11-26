#!/usr/bin/env bash
# Quick helper to run the platform health & verification check
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ -f "backend/venv/bin/python" ]; then
    backend/venv/bin/python check_system.py "$@"
else
    python3 check_system.py "$@"
fi
