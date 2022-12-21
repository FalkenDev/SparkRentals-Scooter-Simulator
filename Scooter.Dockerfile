FROM node:latest

RUN mkdir -p /scooter

WORKDIR /scooter

COPY . .

RUN npm install

CMD ["npm", "run", "start-hive"]