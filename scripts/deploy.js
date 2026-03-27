const hre = require("hardhat");

async function main() {
  // This tells Hardhat to find your "CredentialVerification" contract
  const Credential = await hre.ethers.getContractFactory("CredentialVerification");
  
  console.log("Deploying contract... please wait.");
  const credential = await Credential.deploy();

  await credential.waitForDeployment();

  // This is the "Address" you need to save!
  console.log("Success! Contract deployed to:", await credential.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});