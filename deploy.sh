#!/bin/bash

echo "🚀 Starting deployment process..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Compile contracts
echo "🔨 Compiling smart contracts..."
npm run compile

# Step 3: Deploy to Sepolia
echo "⛓️ Deploying contracts to Sepolia testnet..."
npm run deploy:sepolia

# Step 4: Build frontend
echo "🏗️ Building frontend..."
npm run build

echo "✅ Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with the deployed contract addresses"
echo "2. Deploy the 'dist' folder to your hosting platform"
echo "3. Configure environment variables on your hosting platform"
