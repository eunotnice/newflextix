import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the EventTicketing and BlindBagNFT contracts
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployEventTicketing: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy EventTicketing contract
  await deploy("EventTicketing", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  // Deploy BlindBagNFT contract
  await deploy("BlindBagNFT", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  // Get the deployed contracts to interact with them after deploying
  const eventTicketing = await hre.ethers.getContract<Contract>("EventTicketing", deployer);
  const blindBagNFT = await hre.ethers.getContract<Contract>("BlindBagNFT", deployer);

  console.log("👋 EventTicketing deployed at:", await eventTicketing.getAddress());
  console.log("👋 BlindBagNFT deployed at:", await blindBagNFT.getAddress());
};

export default deployEventTicketing;

// Tags are useful if you have multiple deploy files and only want to run one of them.
deployEventTicketing.tags = ["EventTicketing", "BlindBagNFT"];
