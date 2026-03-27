const hre = require("hardhat");

async function main() {
  // Ensure this matches your latest deployment address
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const Credential = await hre.ethers.getContractFactory("CredentialVerification");
  const credential = await Credential.attach(contractAddress);

  const [admin, university, student] = await hre.ethers.getSigners();

  // Using 'V3' to ensure a fresh entry on your new node
  const ipfsHash = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco_V3"; 
  const studentAddress = student.address;
  
  // This is the "Golden Number" your circuit confirmed!
  const zkRoot = "18586133768512220936620570745912940619677854269274689475585506675881198879027"; 

  console.log("Issuing certificate to:", studentAddress);

  // Note: Ensure the university address was added as an authorized issuer first!
  const tx = await credential.connect(university).issueCertificate(
    ipfsHash, 
    studentAddress, 
    zkRoot
  );
  await tx.wait();

  console.log("-----------------------------------------");
  console.log("✅ Success! The correct ZK Root is now on the blockchain.");
  console.log("Next: Run npx hardhat run scripts/generate-proof.js");
  console.log("-----------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});