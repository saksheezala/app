#!/usr/bin/env bash
# =============================================================================
# post-deploy-validation.sh
# Placeholder post-deployment validation script for QA/UAT environments.
# Replace the echo stubs with real smoke tests, API checks, etc.
# =============================================================================
set -euo pipefail

ENVIRONMENT="${1:-QA}"
BASE_URL="${2:-http://localhost:3000}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Post-Deployment Validation"
echo " Environment : $ENVIRONMENT"
echo " Base URL    : $BASE_URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ─── Step 1: Health Check ─────────────────────────────────────
echo "[1/3] Running health check..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/health")
if [ "$HEALTH_STATUS" -ne 200 ]; then
  echo "❌ Health check FAILED (HTTP $HEALTH_STATUS)"
  exit 1
fi
echo "✅ Health check passed (HTTP $HEALTH_STATUS)"

# ─── Step 2: Readiness Probe ──────────────────────────────────
echo "[2/3] Checking readiness probe..."
READY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/health/ready")
if [ "$READY_STATUS" -ne 200 ]; then
  echo "❌ Readiness probe FAILED (HTTP $READY_STATUS)"
  exit 1
fi
echo "✅ Readiness probe passed (HTTP $READY_STATUS)"

# ─── Step 3: Smoke Test — Items API ───────────────────────────
echo "[3/3] Smoke testing /api/v1/items..."
ITEMS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/v1/items")
if [ "$ITEMS_STATUS" -ne 200 ]; then
  echo "❌ Items API smoke test FAILED (HTTP $ITEMS_STATUS)"
  exit 1
fi
echo "✅ Items API smoke test passed (HTTP $ITEMS_STATUS)"

echo ""
echo "🎉 All post-deployment validations passed for $ENVIRONMENT!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
