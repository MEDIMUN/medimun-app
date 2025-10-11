# Use Bun official image for building and runtime
FROM oven/bun:1 as builder

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Set working directory
WORKDIR /usr/src/app

# Install OpenSSL (required by Prisma)
RUN apk add --no-cache openssl

# Copy only what’s needed to install dependencies
COPY package.json prisma ./

# Install dependencies
RUN bun install

# Generate Prisma client
RUN bunx prisma generate

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build


# --- Production image ---
FROM oven/bun:1 as production

WORKDIR /usr/src/app

# Install OpenSSL in runtime too
RUN apk add --no-cache openssl

# Copy from builder
COPY --from=builder /usr/src/app /usr/src/app

# Set environment for production
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start the app
CMD ["bun", "start"]
