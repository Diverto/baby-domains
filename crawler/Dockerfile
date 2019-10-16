FROM node:latest

WORKDIR /app

RUN npm install -g snyk
COPY package.json .
COPY package-lock.json .
RUN npm ci

COPY . .

CMD ["npm", "run", "start"]