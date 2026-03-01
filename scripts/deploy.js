const hre = require("hardhat");

async function main() {
  const Credential = await hre.ethers.getContractFactory("CredentialVerification");
  const credential = await Credential.deploy();

  await credential.waitForDeployment();

  console.log("Contract deployed to:", await credential.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});