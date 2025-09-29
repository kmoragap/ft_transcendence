FROM node:23-bullseye-slim

WORKDIR /app

COPY package*.json ./

RUN npm clean-install

COPY . .

RUN rm -rf node_modules package-lock.json

RUN npm install -g ts-node

# Create pong directory and build the game
RUN mkdir -p src/pong && npm run build

CMD ["ts-node", "src/index.ts"]