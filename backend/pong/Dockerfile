FROM node:23-bullseye-slim

WORKDIR /app

COPY package*.json ./

RUN npm clean-install

COPY . .

RUN npm install -g ts-node
RUN npm rebuild esbuild

# Create pong directory and build the game
RUN mkdir -p src/pong && npm run build

CMD ["ts-node", "src/index.ts"]