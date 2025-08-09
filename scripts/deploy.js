const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Deploying contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy EventTicketing contract
  console.log("\nDeploying EventTicketing contract...");
  const EventTicketing = await ethers.getContractFactory("EventTicketing");
  const eventTicketing = await EventTicketing.deploy();
  await eventTicketing.waitForDeployment();
  
  const eventTicketingAddress = await eventTicketing.getAddress();
  console.log("EventTicketing deployed to:", eventTicketingAddress);

  // Deploy BlindBagNFT contract
  console.log("\nDeploying BlindBagNFT contract...");
  const BlindBagNFT = await ethers.getContractFactory("BlindBagNFT");
  const blindBagNFT = await BlindBagNFT.deploy();
  await blindBagNFT.waitForDeployment();
  
  const blindBagAddress = await blindBagNFT.getAddress();
  console.log("BlindBagNFT deployed to:", blindBagAddress);

  // Save contract addresses and ABIs
  const contractAddresses = {
    EventTicketing: eventTicketingAddress,
    BlindBagNFT: blindBagAddress,
    network: await ethers.provider.getNetwork()
  };

  // Create contracts directory if it doesn't exist
  if (!fs.existsSync("src/contracts")) {
    fs.mkdirSync("src/contracts", { recursive: true });
  }

  // Save addresses
  fs.writeFileSync(
    "src/contracts/addresses.json",
    JSON.stringify(contractAddresses, null, 2)
  );

  // Save ABIs
  const EventTicketingArtifact = await ethers.getContractFactory("EventTicketing");
  const BlindBagNFTArtifact = await ethers.getContractFactory("BlindBagNFT");

  fs.writeFileSync(
    "src/contracts/EventTicketing.json",
    JSON.stringify({
      abi: EventTicketingArtifact.interface.formatJson(),
      address: eventTicketingAddress
    }, null, 2)
  );

  fs.writeFileSync(
    "src/contracts/BlindBagNFT.json",
    JSON.stringify({
      abi: BlindBagNFTArtifact.interface.formatJson(),
      address: blindBagAddress
    }, null, 2)
  );

  console.log("\n✅ Deployment completed!");
  console.log("📄 Contract addresses saved to src/contracts/addresses.json");
  console.log("📄 ABIs saved to src/contracts/");
  
  console.log("\n🔧 Update your .env file with:");
  console.log(`VITE_EVENT_TICKETING_CONTRACT=${eventTicketingAddress}`);
  console.log(`VITE_BLIND_BAG_CONTRACT=${blindBagAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
