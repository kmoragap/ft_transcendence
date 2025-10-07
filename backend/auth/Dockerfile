FROM node:23-bullseye-slim

WORKDIR /app

COPY package*.json ./

RUN npm clean-install

RUN npm install nodemailer --save
RUN npm install --save-dev @types/nodemailer

COPY . .

RUN npx prisma generate

RUN npx prisma db push


RUN npm install -g ts-node

CMD ["ts-node", "src/index.ts"]
