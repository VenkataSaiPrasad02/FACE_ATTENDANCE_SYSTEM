"""
Uvicorn configuration for optimal performance.
"""
import multiprocessing

# Number of worker processes
# Use CPU count for CPU-bound tasks like face recognition
workers = min(multiprocessing.cpu_count(), 4)

# Bind address
host = "0.0.0.0"
port = 8000

# Connection settings
limit_concurrency = 100
max_requests = 1000
max_requests_jitter = 50

# Keep-alive connections
keepalive_timeout = 5
timeout_keep_alive = 5

# Logging
log_level = "info"
access_log = True

# For production, use:
# uvicorn.run("app.main:app", config=Config("uvicorn_config.py"))