#!/bin/bash

# Cross-platform setup script
set -e

echo "🚀 Setting up ft_transcendence for cross-platform development..."

# Detect platform
if [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PLATFORM="linux"
else
    echo "❌ Unsupported platform: $OSTYPE"
    exit 1
fi

echo "📱 Detected platform: $PLATFORM"

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
echo "📦 Node.js version: $NODE_VERSION"

# Install dependencies with platform-specific handling
echo "📦 Installing dependencies..."

# Frontend setup
cd frontend
echo "🎨 Setting up frontend..."
rm -rf node_modules package-lock.json
npm install --force

# Build CSS to ensure it works
echo "🎨 Building CSS..."
npm run build:css

cd ..

# Backend setup
echo "⚙️ Setting up backend services..."
for service in auth users pong-db chat; do
    if [ -d "backend/$service" ]; then
        echo "📦 Setting up backend/$service..."
        cd "backend/$service"
        rm -rf node_modules package-lock.json
        npm install --force
        cd ../..
    fi
done

echo "✅ Setup complete! Your project should now work on $PLATFORM"
echo "🚀 Run 'npm run dev' in the frontend directory to start development"
