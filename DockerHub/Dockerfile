# Select source image
FROM node:10-alpine

# Install all dependencies
RUN apk --update add --no-cache \
    git 

# Create app directories
RUN mkdir -p /tmp/clone
RUN mkdir -p /usr/app/config
WORKDIR /tmp/clone

# We download the eae compute
RUN git clone -b master https://github.com/dsi-icl/eae-compute

WORKDIR /tmp/clone/eae-compute

# Bundle app
RUN cp LICENSE /usr/app/ \
    && cp package.json /usr/app/ \
    && cp package-lock.json /usr/app/ \
    && cp -r src /usr/app/src

WORKDIR /usr/app

# Install eae-compute npm dependencies
RUN npm install --production 

# Clean up the image
RUN apk del git \
    && rm -rf /var/cache/apk/* \
    && rm -rf /tmp/clone \
    && npm cache clean  --force \
    && npm uninstall --global npm

# Run compute service
EXPOSE 80
CMD [ "node", "./src/index.js" ]
