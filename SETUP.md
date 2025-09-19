# 🚀 Cross-Platform Setup Guide

This project is designed to work on both **Ubuntu** and **macOS** without manual dependency management.

## 📋 Prerequisites

- **Node.js**: Version 20.19.5 (use `.nvmrc` file)
- **npm**: Latest version
- **Git**: For cloning the repository

## 🛠️ Quick Setup (Recommended)

### Option 1: Automated Setup Script

**For macOS users:**
```bash
# Clone the repository
git clone <your-repo-url>
cd ft_transcendence

# Run the macOS-specific setup script (handles permissions)
./scripts/setup-macos.sh
```

**For Ubuntu/Linux users:**
```bash
# Clone the repository
git clone <your-repo-url>
cd ft_transcendence

# Run the cross-platform setup script
./scripts/setup.sh
```

### Option 2: Manual Setup
```bash
# Frontend setup
cd frontend
rm -rf node_modules package-lock.json
npm install --force
npm run build:css

# Backend services setup
cd ../backend
for service in auth users pong-db chat; do
    cd $service
    rm -rf node_modules package-lock.json
    npm install --force
    cd ..
done
```

### Option 3: Docker Setup (Most Reliable)
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Or build and run manually
cd frontend
docker build -f Dockerfile.dev -t ft_transcendence-frontend .
docker run -p 5173:5173 -v $(pwd):/app ft_transcendence-frontend
```

## 🔧 Troubleshooting

### Common Issues:

1. **Native Module Errors** (ARM64/x86_64):
   ```bash
   # Clean reinstall
   npm run clean
   npm install --force
   ```

2. **Tailwind CSS Build Errors**:
   ```bash
   npm run build:css
   ```

3. **Platform-Specific Dependencies**:
   ```bash
   # Use the setup script
   ./scripts/setup.sh
   ```

4. **macOS Permission Denied** (node_modules):
   ```bash
   # Use the macOS-specific script
   ./scripts/setup-macos.sh
   
   # Or manually with sudo
   sudo rm -rf node_modules
   npm install --force
   ```

## 📱 Platform-Specific Notes

### macOS (Apple Silicon/Intel):
- Uses `--force` flag to handle native dependencies
- Automatically detects ARM64 vs x86_64

### Ubuntu/Linux:
- Handles both ARM64 and x86_64 architectures
- Uses platform-specific native binaries

## 🚀 Development Commands

```bash
# Start development server
cd frontend
npm run dev

# Build for production
npm run build

# Clean and reinstall
npm run reinstall
```

## ✅ Verification

After setup, verify everything works:
1. Frontend builds without errors
2. CSS compiles successfully
3. Development server starts on port 5173
4. No native module errors in console

---

**Need help?** Check the troubleshooting section or run `./scripts/setup.sh` again.
