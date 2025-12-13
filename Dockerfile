FROM node:lts

# Install build deps for sqlite3 node module
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests first (better caching)
COPY package*.json ./

# Install node dependencies
RUN npm install

# Copy application source
COPY . .

# Create non-root user
RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs -s /bin/bash -m nodejs

RUN mkdir -p /app/db && chown -R nodejs:nodejs /app/db

USER nodejs

EXPOSE 3000

CMD ["npm", "start"]
