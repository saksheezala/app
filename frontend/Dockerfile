# =============================================================================
# frontend/Dockerfile — Multi-stage build for the React + Vite SPA
#
# Stage 1 (deps):    Install ALL dependencies (cache layer)
# Stage 2 (builder): Compile TypeScript + run Vite production build
# Stage 3 (runtime): Minimal nginx:alpine serving only the static dist/
# =============================================================================

# ── Stage 1: Dependency Cache ─────────────────────────────────────────────────
FROM node:20-alpine AS deps

# Install OS-level build tools needed by some native npm packages
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy only the package manifests first to maximise layer cache re-use.
# This layer is invalidated ONLY when package*.json changes, not on src changes.
COPY package.json package-lock.json ./

RUN npm ci --frozen-lockfile

# ── Stage 2: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy installed node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Accept the backend API URL as a build argument so Vite can bake it in.
# Override this per-environment in the pipeline:
#   docker build --build-arg VITE_API_URL=https://api.myapp.com ...
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=${VITE_API_URL}

# TypeScript compile + Vite production bundle → dist/
RUN npm run build

# ── Stage 3: Runtime (Nginx) ──────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove the default nginx config
RUN rm /etc/nginx/nginx.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the compiled SPA from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Drop privileges — run nginx as non-root
# nginx:alpine already runs the worker processes as 'nginx' user (uid 101)
# We just need the master process to be able to bind port 80 via CAP_NET_BIND_SERVICE
EXPOSE 80

# Nginx runs in foreground in daemon-off mode
CMD ["nginx", "-g", "daemon off;"]

# ── Metadata ──────────────────────────────────────────────────────────────────
LABEL org.opencontainers.image.title="cicd-monorepo-frontend" \
      org.opencontainers.image.description="React + Vite SPA served by Nginx" \
      org.opencontainers.image.source="https://github.com/your-org/cicd-monorepo"
