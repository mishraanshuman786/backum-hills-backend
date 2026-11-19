
FROM oven/bun:1

WORKDIR /app

# Copy dependency manifests
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy application source
COPY . .

# Render provides the PORT environment variable
EXPOSE 5000

# Start the Bun server
CMD ["bun", "run", "start"]
