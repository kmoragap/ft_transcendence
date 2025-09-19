#!/bin/bash

# macOS-specific setup script with proper permission handling
set -e

echo "🍎 Setting up ft_transcendence for macOS..."

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script is for macOS only. Use setup.sh for other platforms."
    exit 1
fi

echo "📱 Detected macOS platform"

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
echo "📦 Node.js version: $NODE_VERSION"

# Function to safely remove node_modules
safe_remove_node_modules() {
    local dir=$1
    if [ -d "$dir/node_modules" ]; then
        echo "🗑️ Removing node_modules in $dir..."
        # Try without sudo first, then with sudo if needed
        rm -rf "$dir/node_modules" 2>/dev/null || {
            echo "⚠️ Permission denied, trying with sudo..."
            sudo rm -rf "$dir/node_modules"
        }
    fi
    rm -f "$dir/package-lock.json"
}

# Frontend setup
echo "🎨 Setting up frontend..."
cd frontend
safe_remove_node_modules "."
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
        safe_remove_node_modules "."
        npm install --force
        cd ../..
    fi
done

echo "✅ macOS setup complete!"
echo "🚀 Run 'npm run dev' in the frontend directory to start development"
