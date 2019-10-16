FROM node:latest

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm ci
RUN npm install

COPY . .

CMD ["npm", "run", "start"]