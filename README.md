# NFT Event Ticketing Platform

A decentralized event ticketing platform built on Ethereum that uses NFTs as tickets, providing transparency, authenticity, and unique digital collectibles for event attendees.

## 🚀 Features

- **Blockchain-Powered Tickets**: Each ticket is an NFT on the Ethereum blockchain
- **Multiple Ticket Tiers**: Create different pricing tiers for your events
- **Secure Transactions**: All purchases are handled through smart contracts
- **Event Management**: Create and manage events with full control
- **Wallet Integration**: Connect with MetaMask and other Web3 wallets
- **Real-time Updates**: Live ticket availability and sales tracking
- **Mobile Responsive**: Works seamlessly on all devices

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Blockchain**: Ethereum, Solidity, Hardhat
- **Web3**: Ethers.js, MetaMask integration
- **Smart Contracts**: OpenZeppelin standards (ERC721)
- **Network**: Ethereum Sepolia Testnet

## 📋 Prerequisites

- Node.js (v16 or higher)
- MetaMask wallet extension
- Sepolia testnet ETH for transactions

## 🔧 Installation & Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd nft-event-ticketing-platform
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Setup**
   - Copy \`.env.example\` to \`.env\`
   - Add your private key and RPC URL:
   \`\`\`
   PRIVATE_KEY=your_wallet_private_key
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_key
   ETHERSCAN_API_KEY=your_etherscan_api_key
   \`\`\`

4. **Compile Smart Contracts**
   \`\`\`bash
   npm run compile
   \`\`\`

5. **Deploy to Sepolia Testnet**
   \`\`\`bash
   npm run deploy:sepolia
   \`\`\`

6. **Update Environment Variables**
   After deployment, update your \`.env\` file with the contract addresses:
   \`\`\`
   VITE_EVENT_TICKETING_CONTRACT=deployed_contract_address
   VITE_BLIND_BAG_CONTRACT=deployed_blind_bag_address
   \`\`\`

7. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

## 🎫 How It Works

### For Event Organizers:
1. Connect your wallet
2. Create an event with details and ticket tiers
3. Set pricing and supply limits for each tier
4. Manage ticket sales and event status

### For Attendees:
1. Browse available events
2. Connect your wallet
3. Purchase NFT tickets with ETH
4. View your tickets in "My Tickets"
5. Present NFT for event entry

## 📱 Smart Contract Features

### EventTicketing.sol
- Create and manage events
- Multiple ticket tiers per event
- Purchase limits per wallet
- Ticket validation system
- Revenue distribution to organizers

### BlindBagNFT.sol
- Post-event collectible rewards
- Rarity-based distribution system
- Decorative NFT stickers and effects

## 🔐 Security Features

- **Reentrancy Protection**: All payable functions protected
- **Access Control**: Only organizers can manage their events
- **Supply Limits**: Prevents overselling of tickets
- **Wallet Limits**: Prevents ticket hoarding
- **Time Validation**: Tickets can only be purchased before events start

## 🌐 Network Configuration

The platform is configured for Ethereum Sepolia testnet:
- **Chain ID**: 11155111
- **RPC URL**: Sepolia Infura endpoint
- **Block Explorer**: https://sepolia.etherscan.io

## 🎨 UI/UX Features

- **Glassmorphism Design**: Modern, translucent interface
- **Responsive Layout**: Mobile-first design approach
- **Real-time Updates**: Live ticket availability
- **Wallet Status**: Clear connection indicators
- **Transaction Feedback**: Loading states and confirmations

## 🧪 Testing

Run local Hardhat network for testing:
\`\`\`bash
npm run node
npm run deploy:localhost
\`\`\`

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review smart contract code

---

**⚠️ Disclaimer**: This is a testnet application. Do not use real ETH or deploy to mainnet without thorough testing and security audits.
