#!/bin/bash

# Render build script for production deployment
echo "🚀 Starting production build..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push schema to database (handles existing data better than migrate)
echo "🗄️ Syncing database schema..."
npx prisma db push --accept-data-loss

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Build completed successfully!"