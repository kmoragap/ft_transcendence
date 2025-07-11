FROM node:23-bullseye-slim

WORKDIR /app

COPY package*.json ./

RUN npm clean-install

COPY . .

RUN npx prisma generate

CMD ["node", "src/index.ts"]  
