FROM node:20.11.1-slim

WORKDIR /app

COPY package.json package-lock.json* .npmrc ./
RUN npm install

COPY . ./

EXPOSE 3000
ENTRYPOINT ["npm", "start"]
