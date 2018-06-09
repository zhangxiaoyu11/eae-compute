# Select source image
FROM node:10-alpine

# Install all dependencies
RUN apk --update add --no-cache \
    git 

# Create app directories
RUN mkdir -p /usr/app
WORKDIR /usr/app

# Install app dependencies
COPY ./package.json /usr/app/
COPY ./package-lock.json /usr/app/

# Install eae-compute npm dependencies
RUN npm install --production

# Bundle app
COPY ./src /usr/app/src
COPY ./config/eae.compute.config.js /usr/app/config/eae.compute.config.js

# Clean up the image
RUN apk del git \
    && rm -rf /var/cache/apk/* \
    && npm cache clean  --force \
    && npm uninstall --global npm


# Run compute service
EXPOSE 80
CMD [ "node", "./src/index.js" ]
