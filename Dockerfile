FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm instal

Copy . .

RUN npm run build

EXPOSE 3001

CMD ["node", "dist/main.js"]