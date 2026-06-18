# =============================================================================
# backend/Dockerfile — Multi-stage build for the Node.js + Express API
#
# Stage 1 (deps):    Install ALL dependencies (cache layer)
# Stage 2 (builder): Compile TypeScript → dist/
# Stage 3 (runtime): Production-only node_modules + compiled dist/ only
#                    Result: lean, non-root, read-only-capable image
# =============================================================================

# ── Stage 1: Dependency Cache ─────────────────────────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Cache package manifests separately from source to maximise layer re-use
COPY package.json package-lock.json ./

# Install ALL deps (including devDependencies needed to compile TS)
RUN npm ci --frozen-lockfile

# ── Stage 2: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Compile TypeScript → dist/
RUN npm run build

# ── Stage 3: Production Dependency Install ────────────────────────────────────
# Re-install ONLY production dependencies so we don't copy devDeps into runtime
FROM node:20-alpine AS prod-deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --frozen-lockfile --omit=dev

# ── Stage 4: Runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

# Security hardening
RUN apk add --no-cache dumb-init && \
    addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nodeuser

WORKDIR /app

# Copy only what's needed to run the server
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder   /app/dist         ./dist
COPY package.json ./

# Switch to non-root user
USER nodeuser

EXPOSE 3000

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# dumb-init as PID 1 ensures proper signal forwarding and zombie reaping
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]

# ── Metadata ──────────────────────────────────────────────────────────────────
LABEL org.opencontainers.image.title="app-backend" \
      org.opencontainers.image.description="Node.js Express TypeScript REST API" \
      org.opencontainers.image.source="https://github.com/saksheezala/app"
