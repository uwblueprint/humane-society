FROM node:20.11.1-slim

WORKDIR /app

COPY package.json yarn.lock* tsconfig.json ./

# libcurl4 is required for mongodb-memory-server, which is used for testing
# Using --fix-missing and retrying to handle potential package repository issues
RUN apt-get update && apt-get install -y --fix-missing libcurl4 || \
    (apt-get clean && apt-get update && apt-get install -y libcurl4)

RUN yarn install

COPY . ./

EXPOSE 8080
ENTRYPOINT ["yarn", "run", "dev"]
