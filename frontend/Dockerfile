# ============================================
# Frontend Dockerfile - Next.js Application
# ============================================
# Multi-stage build for optimized production image

# Stage 1: Dependencies - install node modules
FROM node:20-alpine AS deps

WORKDIR /app

# Copy dependency files for better layer caching
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Install dependencies based on available lock file
RUN \
	if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
	elif [ -f package-lock.json ]; then npm ci; \
	elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile; \
	else npm install; \
	fi


# Stage 2: Builder - build the Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set build-time environment variables
ARG BACKEND_URL=http://backend:8000
ENV BACKEND_URL=${BACKEND_URL}

# Build the Next.js application
RUN npm run build


# Stage 3: Runner - lean production image
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
	adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Expose the frontend port
EXPOSE 3000

# Set runtime environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
	CMD wget --spider -q http://localhost:3000 || exit 1

# Start the Next.js server
CMD ["node", "server.js"]
