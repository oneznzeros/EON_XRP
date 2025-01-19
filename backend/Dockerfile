# Use official Python image
FROM python:3.9-slim-buster AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Create a non-root user
RUN addgroup --system --gid 1001 eonxrp
RUN adduser --system --uid 1001 eonxrp

# Set permissions
RUN chown -R eonxrp:eonxrp /app

# Switch to non-root user
USER eonxrp

# Expose port for the application
EXPOSE 8000

# Use uvicorn to run the application
CMD ["uvicorn", "src.eon_xrp.main:app", "--host", "0.0.0.0", "--port", "8000"]
