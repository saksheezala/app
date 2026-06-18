#!/usr/bin/env bash
# =============================================================================
# scripts/docker-build-push.sh
#
# Reusable Docker build + push script called by Azure DevOps pipelines.
# Implements the full tagging strategy across all branches.
#
# Usage (called by the pipeline, not manually):
#   ./scripts/docker-build-push.sh <service> <branch> <sha> <registry>
#
#   service  : "frontend" or "backend"
#   branch   : Git branch name (e.g. "feature/my-feature", "release", "main")
#   sha      : Git short SHA (7 chars)
#   registry : Docker Hub username/org (e.g. "myorg")
#
# Example:
#   ./scripts/docker-build-push.sh backend main abc1234 myorg
# =============================================================================
set -euo pipefail

SERVICE="${1:?Error: service name required (frontend|backend)}"
BRANCH="${2:?Error: branch name required}"
SHORT_SHA="${3:?Error: git short SHA required}"
REGISTRY="${4:?Error: Docker Hub registry (username/org) required}"
VITE_API_URL="${VITE_API_URL:-http://localhost:3000}"

IMAGE="${REGISTRY}/app-${SERVICE}"
DOCKERFILE="./${SERVICE}/Dockerfile"
CONTEXT="./${SERVICE}"

# ── Sanitise branch name for use in Docker tags ───────────────────────────────
# Docker tags cannot contain slashes — replace with hyphens
SAFE_BRANCH="${BRANCH//\//-}"

# ── Determine tags based on branch ───────────────────────────────────────────
declare -a TAGS=()

case "${BRANCH}" in

  feature/*)
    # feature branches → tagged as 'dev' + a unique immutable tag
    TAGS=(
      "${IMAGE}:dev"
      "${IMAGE}:${SAFE_BRANCH}-${SHORT_SHA}"
    )
    ;;

  release)
    # release branch → tagged for QA and UAT promotion
    TAGS=(
      "${IMAGE}:qa"
      "${IMAGE}:release-${SHORT_SHA}"
    )
    ;;

  main)
    # main branch → tagged for STAGE initially; PROD tag applied after approvals
    # The pipeline promotes the same SHA to :prod after the final approval gate
    TAGS=(
      "${IMAGE}:stage"
      "${IMAGE}:main-${SHORT_SHA}"
    )
    ;;

  *)
    # fallback for any other branch (e.g. hotfix, dependabot)
    TAGS=(
      "${IMAGE}:${SAFE_BRANCH}-${SHORT_SHA}"
    )
    ;;
esac

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Docker Build + Push"
echo " Service  : ${SERVICE}"
echo " Branch   : ${BRANCH}"
echo " SHA      : ${SHORT_SHA}"
echo " Registry : ${REGISTRY}"
echo " Tags     :"
for tag in "${TAGS[@]}"; do echo "   → ${tag}"; done
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Build with all tags ───────────────────────────────────────────────────────
BUILD_ARGS=()
if [ "${SERVICE}" = "frontend" ] && [ -n "${VITE_API_URL}" ]; then
  BUILD_ARGS+=(--build-arg "VITE_API_URL=${VITE_API_URL}")
fi

TAG_ARGS=()
for tag in "${TAGS[@]}"; do
  TAG_ARGS+=(-t "${tag}")
done

echo "[BUILD] docker buildx build ${BUILD_ARGS[*]} ${TAG_ARGS[*]} ${CONTEXT}"
docker buildx build \
  --target runtime \
  --platform linux/amd64 \
  --cache-from "type=registry,ref=${IMAGE}:buildcache" \
  --cache-to   "type=registry,ref=${IMAGE}:buildcache,mode=max" \
  --push \
  "${BUILD_ARGS[@]}" \
  "${TAG_ARGS[@]}" \
  --file "${DOCKERFILE}" \
  "${CONTEXT}"

echo "✅ Build and push complete."

# ── PROD promotion (called separately after manual approval in pipeline) ──────
# The pipeline calls this with PROMOTE_TO_PROD=true after the approval gate.
if [ "${PROMOTE_TO_PROD:-false}" = "true" ] && [ "${BRANCH}" = "main" ]; then
  PROD_TAG="${IMAGE}:prod"
  VERSIONED_TAG="${IMAGE}:v${SHORT_SHA}"
  echo "[PROMOTE] Tagging ${IMAGE}:main-${SHORT_SHA} → :prod and :v${SHORT_SHA}"
  docker buildx imagetools create \
    --tag "${PROD_TAG}" \
    --tag "${VERSIONED_TAG}" \
    "${IMAGE}:main-${SHORT_SHA}"
  echo "✅ PROD promotion complete: ${PROD_TAG}"
fi
