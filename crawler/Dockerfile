FROM node:alpine

RUN mkdir -p /app/node_modules && chown -R node:node /app
WORKDIR /app

RUN apk update && apk upgrade
RUN apk add npm

RUN npm install -g snyk
COPY ./package*.json ./
COPY .snyk .

USER node

RUN npm install

COPY --chown=node:node . .

CMD ["npm", "run", "start"]