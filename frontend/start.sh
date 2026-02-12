#!/bin/sh
# ============================================
# Startup script - Nginx + Next.js
# ============================================
# Starts Next.js as the nextjs user on port 3001,
# then starts Nginx on port 3000 as the main process.
#
# IMPORTANT: We hardcode PORT=3001 for Next.js because
# Dokploy/hosting platforms may override PORT=3000,
# which would conflict with Nginx on port 3000.

set -e

# Force Next.js to use port 3001 (Nginx uses 3000)
export PORT=3001
export HOSTNAME=0.0.0.0

echo "Starting MCP Frontend..."
echo "  NODE_ENV: ${NODE_ENV}"
echo "  BACKEND_URL: ${BACKEND_URL}"
echo "  Next.js port: 3001 (internal)"
echo "  Nginx port: 3000 (exposed)"

# Start Next.js in the background as the nextjs user
echo "Starting Next.js server..."
su-exec nextjs node server.js &
NEXTJS_PID=$!

# Wait for Next.js to be ready
echo "Waiting for Next.js to start on port 3001..."
RETRIES=30
while [ $RETRIES -gt 0 ]; do
	if nc -z 127.0.0.1 3001 2>/dev/null; then
		echo "Next.js is ready!"
		break
	fi
	RETRIES=$((RETRIES - 1))
	sleep 1
done

if [ $RETRIES -eq 0 ]; then
	echo "ERROR: Next.js failed to start within 30 seconds"
	exit 1
fi

# Start Nginx in the foreground (main process)
echo "Starting Nginx on port 3000..."
exec nginx -g "daemon off;"
