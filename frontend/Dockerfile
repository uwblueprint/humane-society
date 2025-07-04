FROM node:20.11.1-slim

WORKDIR /app

COPY package.json yarn.lock* .yarnrc.yml* ./
RUN yarn install

COPY . ./

EXPOSE 3000
ENTRYPOINT ["yarn", "start"]
