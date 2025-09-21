# Use official Node.js image (Debian-based, not Alpine)
FROM node:23-bullseye-slim

# Set working directory
WORKDIR /app

# Install only the package manager files first
COPY package*.json ./

# Install dependencies
RUN rm -rf node_modules package-lock.json

RUN npm install

# Copy the rest of your project
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite + Tailwind in watch mode
CMD ["npm", "run", "dev"]