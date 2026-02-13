# ============================================
# Frontend Dockerfile - Next.js Application
# ============================================
# Multi-stage build for Dokploy deployment
# Next.js standalone serves directly on port 3000

# Stage 1: Build the Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Server-side environment variable (available at build + runtime)
ARG BACKEND_URL=http://localhost:8000
ENV BACKEND_URL=${BACKEND_URL}

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Ensure public directory exists (may not exist in all projects)
RUN mkdir -p /app/public

# Build Next.js application
RUN npm run build


# Stage 2: Runtime - Next.js standalone
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for Next.js
RUN addgroup --system --gid 1001 nodejs && \
	adduser --system --uid 1001 nextjs

# Server-side runtime environment variable
ARG BACKEND_URL=http://localhost:8000
ENV BACKEND_URL=${BACKEND_URL}

# Copy Next.js standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create empty public directory (Next.js standalone includes public assets in .next/static)
# Public assets are served from .next/static, but some apps may expect /public to exist
RUN mkdir -p ./public

# Verify server.js exists (critical for startup)
RUN if [ ! -f "server.js" ]; then \
		echo "ERROR: server.js not found after copying standalone build!" && \
		echo "Contents of /app:" && \
		ls -la && \
		exit 1; \
	fi && \
	echo "Verified server.js exists"

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
	CMD wget --spider -q http://localhost:3000 || exit 1

# Force PORT=3000 and HOSTNAME=0.0.0.0 at startup
# This overrides any platform-injected env vars (e.g. Dokploy)
CMD ["sh", "-c", "PORT=3000 HOSTNAME=0.0.0.0 node server.js"]
