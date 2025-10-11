# Use Bun official image for building and runtime
FROM oven/bun:1 as builder

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Set working directory
WORKDIR /usr/src/app

# Copy files needed for installation
COPY bun.lockb package.json prisma ./

# Install dependencies (cached layer)
RUN bun install --frozen-lockfile

# Generate Prisma client
RUN bunx prisma generate

# Copy the rest of the app
COPY . .

# Build the application
RUN bun run build

# Production image
FROM oven/bun:1 as production

WORKDIR /usr/src/app

# Copy built app and dependencies from builder
COPY --from=builder /usr/src/app /usr/src/app

# Set environment for production
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start the app
CMD ["bun", "start"]
