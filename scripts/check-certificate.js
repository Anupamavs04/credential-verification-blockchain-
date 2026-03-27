const hre = require("hardhat");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const Credential = await hre.ethers.getContractFactory("CredentialVerification");
  const credential = await Credential.attach(contractAddress);

  // The IPFS hash we used in the previous step
  const ipfsHash = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"; 

  // Call the public verification function
  const result = await credential.verifyCertificate(ipfsHash);

  console.log("--- Blockchain Record ---");
  console.log("Is Valid:", result.isValid);
  console.log("Issuer Address:", result.issuer);
  console.log("Issue Date (Unix):", result.date.toString());
  
  // Also check if the ZK Root exists
  const zkRoot = "12345678901234567890";
  const rootExists = await credential.zkRoots(zkRoot);
  console.log("Is ZK Root Registered?:", rootExists);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});