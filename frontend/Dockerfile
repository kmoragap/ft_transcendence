# Use official Node.js image (Debian-based, not Alpine)
FROM node:20-bullseye

# Set working directory
WORKDIR /app

# Install only the package manager files first
COPY package*.json ./

# Install dependencies (including optional native ones like rollup or parcel)
RUN npm install --include=optional

# Copy the rest of your project
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite + Tailwind in watch mode
CMD ["npm", "run", "dev"]
