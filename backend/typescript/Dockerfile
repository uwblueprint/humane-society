FROM node:20.11.1-slim

WORKDIR /app

COPY package.json package-lock.json* tsconfig.json ./

# libcurl4 is required for mongodb-memory-server, which is used for testing
RUN apt-get update && apt-get install -y libcurl4

RUN npm install

COPY . ./

EXPOSE 8080
ENTRYPOINT ["npm", "run", "dev"]
