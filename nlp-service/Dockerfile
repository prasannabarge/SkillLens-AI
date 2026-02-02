# NLP Service Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for PDF parsing
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Start the service
CMD ["python", "main.py"]
