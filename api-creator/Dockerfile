FROM node:latest

WORKDIR /app

RUN npm install -g snyk
COPY package.json .
RUN npm install

COPY . .

CMD ["npm", "run", "start"]