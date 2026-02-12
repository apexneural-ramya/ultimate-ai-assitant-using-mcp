# ============================================
# Backend Dockerfile - FastAPI + MCP Service
# ============================================
# Multi-stage build for a lean production image

# Stage 1: Builder - install dependencies
FROM python:3.12-slim AS builder

WORKDIR /app

# Install system dependencies required for building Python packages
RUN apt-get update && \
	apt-get install -y --no-install-recommends gcc libffi-dev && \
	rm -rf /var/lib/apt/lists/*

# Copy dependency files first for better layer caching
COPY requirements.txt .

# Install Python dependencies into a virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip && \
	pip install --no-cache-dir -r requirements.txt


# Stage 2: Runtime - slim production image
FROM python:3.12-slim AS runtime

WORKDIR /app

# Install Node.js (required for npx MCP server commands)
RUN apt-get update && \
	apt-get install -y --no-install-recommends curl && \
	curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
	apt-get install -y --no-install-recommends nodejs && \
	rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application source code
COPY . .

# Create non-root user for security
RUN groupadd --gid 1000 appuser && \
	useradd --uid 1000 --gid appuser --shell /bin/bash --create-home appuser && \
	chown -R appuser:appuser /app

USER appuser

# Expose the backend port (default 8000)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
	CMD curl -f http://localhost:8000/health || exit 1

# Run the FastAPI backend with uvicorn
CMD ["uvicorn", "backend_service:app", \
	"--host", "0.0.0.0", \
	"--port", "8000", \
	"--workers", "1", \
	"--log-level", "info"]
