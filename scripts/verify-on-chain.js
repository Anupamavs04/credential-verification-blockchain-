const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const Credential = await hre.ethers.getContractFactory("CredentialVerification");
  const credential = await Credential.attach(contractAddress);

  // 1. Load the proof data we generated in the last step
  const proofPath = "ZKP/proof_data.json"; // Changed zkp to ZKP
  if (!fs.existsSync(proofPath)) {
    console.error("❌ Proof file not found! Run generate-proof.js first.");
    return;
  }
  const p = JSON.parse(fs.readFileSync(proofPath));

  console.log("Submitting ZK Proof to the blockchain...");

  // 2. Call the verifyZkProof function on your Smart Contract
  // We pass the a, b, c components of the proof and the public input
  try {
    const isVerified = await credential.verifyZkProof(
      p.a,
      p.b,
      p.c,
      p.input
    );

    if (isVerified) {
      console.log("-----------------------------------------");
      console.log("✅ SUCCESS: The Blockchain has verified your ZK Proof!");
      console.log("The student has proven ownership without revealing their ID.");
      console.log("-----------------------------------------");
    } else {
      console.log("❌ FAILED: The proof was mathematically invalid.");
    }
  } catch (error) {
    console.error("Error during verification:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});