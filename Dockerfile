# Use Node.js 22 LTS
FROM node:22-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy patches folder (required for patchedDependencies)
COPY patches ./patches

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application (client + server)
RUN pnpm run build

# Expose port (Cloud Run uses PORT env variable)
EXPOSE 8080

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Start server
CMD ["pnpm", "run", "start"]
