FROM node:22-alpine

WORKDIR /app

# Install dependencies first (for layer caching)
COPY package*.json ./
RUN npm ci

# Copy the source code
COPY . .

# Build the Vite frontend into dist/
RUN npm run build

# Default environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV DATA_DIR=/app/data

EXPOSE 3001

# Start the combined Express server + frontend
CMD ["node", "server.js"]
