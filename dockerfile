# Use oven/bun as the base image for building and runtime
FROM oven/bun:1 as base

# Define build arguments for build-time usage
ARG DB_USER
ARG DB_PASSWORD
ARG DB_HOST
ARG DB_PORT
ARG DB_NAME

# Set environment variables from the build arguments
ENV DB_USER=$DB_USER
ENV DB_PASSWORD=$DB_PASSWORD
ENV DB_PORT=$DB_PORT
ENV DB_NAME=$DB_NAME
ENV DB_HOST='db1.cluster.medimun.org'

# Copy package.json and install dependencies
COPY package.json /tmp/package.json
RUN cd /tmp && bun install --ignore-engines
RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app/

# Set the working directory
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# Copy the Prisma schema
COPY prisma /usr/src/app/prisma

# Copy the rest of the application files
COPY . /usr/src/app

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN bun run build

# Set environment for production and expose the app
ENV NODE_ENV production
ENV PORT 3000
EXPOSE 3000

# Run the application
CMD ["bun", "start"]
