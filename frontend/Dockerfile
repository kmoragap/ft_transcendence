# Use official Node.js image
FROM node:20

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the project
COPY . .

# Build Tailwind CSS output once
RUN npm run build:css

# Start Tailwind in watch mode (optional for dev)
CMD ["npm", "run", "dev"]
