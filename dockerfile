# Use oven/bun as the base image for building and runtime
FROM node:22-alpine as builder

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Copy package.json and install dependencies
COPY package.json /tmp/package.json
COPY prisma /tmp/prisma
RUN cd /tmp && npm install --ignore-engines --legacy-peer-deps
RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app/

# Set the working directory
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# Copy the rest of the application files
COPY . /usr/src/app

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Set environment for production and expose the app
ENV NODE_ENV production
ENV PORT 3000
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
