# Use Bun official image for building and runtime
FROM oven/bun:1 as builder

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Set working directory
WORKDIR /usr/src/app

# Copy only what’s needed to install dependencies
COPY package.json prisma ./

# Install dependencies (no lockfile)
RUN bun install

# Generate Prisma client
RUN bunx prisma generate

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build

# Production image
FROM oven/bun:1 as production

WORKDIR /usr/src/app

# Copy the built app and dependencies from the builder
COPY --from=builder /usr/src/app /usr/src/app

# Set environment for production
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start the app
CMD ["bun", "start"]
