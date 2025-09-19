# Use official Node.js image (Debian-based, not Alpine)
FROM --platform=linux/amd64 node:23-bullseye-slim

# Set working directory
WORKDIR /app

# Install only the package manager files first
COPY package*.json ./

# Install dependencies
RUN npm ci --include=optional

# Copy the rest of your project
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite + Tailwind in watch mode
CMD ["npm", "run", "dev"]