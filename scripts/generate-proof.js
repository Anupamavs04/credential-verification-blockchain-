const snarkjs = require("snarkjs");
const fs = require("fs");

async function main() {
    // These inputs now match the diagnostic hash your circuit calculated
    const input = {
        "ipfsHashAsNumber": "1", 
        "blockchainRoot": "18586133768512220936620570745912940619677854269274689475585506675881198879027" 
    };

    console.log("Starting ZK Proof generation...");

    try {
        // Generate the proof using your compiled circuit files in the ZKP folder
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            input, 
            "ZKP/certificate_verify_js/certificate_verify.wasm", 
            "ZKP/certificate_verify_0000.zkey"
        );

        console.log("✅ Proof successfully generated!");

        // Format the proof so the Solidity Verifier contract can read it
        const calldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        
        const proofData = {
            a: [argv[0], argv[1]],
            b: [[argv[2], argv[3]], [argv[4], argv[5]]],
            c: [argv[6], argv[7]],
            input: [argv[8]]
        };

        // Create the folder if it doesn't exist and save the file
        if (!fs.existsSync("ZKP")) { fs.mkdirSync("ZKP"); }
        fs.writeFileSync("ZKP/proof_data.json", JSON.stringify(proofData, null, 2));
        
        console.log("-----------------------------------------");
        console.log("💾 SUCCESS: Proof saved to ZKP/proof_data.json");
        console.log("Next step: Run npx hardhat run scripts/verify-on-chain.js");
        console.log("-----------------------------------------");

    } catch (err) {
        console.error("❌ ZK Generation Failed.");
        console.error("Reason:", err.message);
        console.log("\nTip: Make sure the blockchainRoot matches what you issued in issue-certificate.js");
    }
}

main().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});