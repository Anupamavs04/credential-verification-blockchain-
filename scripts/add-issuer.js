const hre = require("hardhat");

async function main() {
  // 1. Your deployed contract address from contract-info.txt
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // 2. Get the contract instance
  const Credential = await hre.ethers.getContractFactory("CredentialVerification");
  const credential = await Credential.attach(contractAddress);

  // 3. Get the list of test accounts from Hardhat
  const [admin, university] = await hre.ethers.getSigners();

  console.log("Admin (Deployer) address:", admin.address);
  console.log("Authorizing University address:", university.address);

  // 4. Call the addIssuer function
  const tx = await credential.addIssuer(university.address);
  await tx.wait();

  console.log("Success! The University is now an authorized issuer.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});