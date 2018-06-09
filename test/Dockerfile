# Select source image
FROM node:10-alpine

# Install all dependencies
RUN apk --update add --no-cache \
    git \
    python2 \
    python3 \
    py-pip \
    && pip install --upgrade pip

# Create app directories
RUN mkdir -p /usr/app && mkdir -p /usr/test
WORKDIR /usr/app

# Install app dependencies
COPY ./package.json /usr/app/
COPY ./package-lock.json /usr/app/
COPY ./src /usr/app/src
COPY ./test/jobs /usr/app/test/jobs
COPY ./test/*.js /usr/app/test/
COPY ./.eslintrc /usr/app/.eslintrc
COPY ./config/eae.compute.test.config.js /usr/app/config/eae.compute.config.js

# Install eae-compute npm dependencies
RUN npm ci

# Cleaning up
RUN apk del git \
    && rm -rf /var/cache/apk/* \
    && npm cache clean --force

EXPOSE 80
