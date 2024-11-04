FROM node:20-alpine as builder

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

COPY package.json /tmp/package.json
RUN cd /tmp && npm install --ignore-engines --legacy-peer-deps
RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app/

WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY . /usr/src/app
RUN npx prisma generate
RUN npm run build
ENV NODE_ENV production
ENV PORT 3000
EXPOSE 3000
CMD ["npm", "start"]