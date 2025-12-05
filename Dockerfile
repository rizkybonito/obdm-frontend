FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

COPY ./public /app/public

COPY ./src/assets /app/src/assets

RUN npm install

COPY . .

COPY .env.dev .env

RUN npm run build

EXPOSE 5001

RUN npm install -g serve

CMD ["serve", "-s", "dist", "-l", "5001"]
