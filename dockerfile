# --- Builder stage ---
FROM oven/bun:1 AS builder

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Set working directory
WORKDIR /usr/src/app

# Install OpenSSL (required by Prisma)
RUN apt-get update -y && apt-get install -y openssl

# Copy only what's needed to install dependencies
COPY package.json prisma ./

# Install dependencies
RUN bun install

# Generate Prisma client
RUN bunx prisma generate

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build


# --- Production stage ---
FROM oven/bun:1 AS production

WORKDIR /usr/src/app

# Copy OpenSSL libraries from builder (avoid re-installing)
COPY --from=builder /usr/lib/x86_64-linux-gnu/libssl.so* /usr/lib/x86_64-linux-gnu/
COPY --from=builder /usr/lib/x86_64-linux-gnu/libcrypto.so* /usr/lib/x86_64-linux-gnu/

# Copy built app and dependencies
COPY --from=builder /usr/src/app /usr/src/app

# Set environment for production
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start the app
CMD ["bun", "start"]
