# ============================================
# Frontend Dockerfile - Next.js Application
# ============================================
# Multi-stage build with in-container Nginx reverse proxy
# Nginx listens on port 3000, proxies to Next.js on port 3001

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


# Stage 2: Runtime - Nginx + Next.js standalone
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install nginx, su-exec, and netcat for health checks
RUN apk add --no-cache nginx su-exec netcat-openbsd

# Create non-root user for Next.js
RUN addgroup --system --gid 1001 nodejs && \
	adduser --system --uid 1001 nextjs

# Server-side runtime environment variable
ARG BACKEND_URL=http://localhost:8000
ENV BACKEND_URL=${BACKEND_URL}

# Copy Next.js standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Verify server.js exists (critical for startup)
RUN if [ ! -f "server.js" ]; then \
		echo "ERROR: server.js not found after copying standalone build!" && \
		echo "Contents of /app:" && \
		ls -la && \
		exit 1; \
	fi && \
	echo "Verified server.js exists"

# Debug: show Alpine nginx file layout
RUN echo "=== Nginx files ===" && \
	find /etc/nginx -type f 2>/dev/null && \
	echo "=== Nginx version ===" && \
	nginx -v 2>&1 || true

# Remove default nginx server configs (keep mime.types and other base files)
RUN rm -f /etc/nginx/http.d/default.conf 2>/dev/null || true && \
	rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true

# Ensure required directories exist
RUN mkdir -p /var/log/nginx /run/nginx /var/lib/nginx/tmp

# Replace main nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Verify nginx config is valid during build
RUN nginx -t 2>&1 && echo "Nginx config OK" || \
	(echo "=== NGINX CONFIG ERROR ===" && cat /etc/nginx/nginx.conf && exit 1)

# Copy startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Next.js runs on port 3001 (internal), Nginx on port 3000 (exposed)
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# Expose port 3000 - Nginx listens here
EXPOSE 3000

# Health check against Nginx on port 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
	CMD wget --spider -q http://localhost:3000 || exit 1

# Start Nginx + Next.js via startup script
CMD ["/start.sh"]
