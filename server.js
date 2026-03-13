// =============================
// LOAD ENV VARIABLES FIRST 🔥
// =============================
require("dotenv").config();

const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const upload = multer();

app.use(express.json());
app.use(cors());

// =============================
// CONFIGURATION
// =============================
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const contractAddress = process.env.CONTRACT_ADDRESS;

console.log("Contract Address:", contractAddress);

// ABI MUST MATCH YOUR SOLIDITY EXACTLY
const contractABI = [
    "function issueCertificate(string _ipfsHash, address _holder) public",
    "function verifyCertificate(string _ipfsHash) public view returns (bool isValid, address issuer, uint256 date)"
];

// =============================
// BLOCKCHAIN CONNECTION
// =============================
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// =============================
// ROUTE: ISSUE CERTIFICATE
// =============================
app.post("/issue", upload.single("certificate"), async (req, res) => {
    try {
        if (!req.file) throw new Error("No file uploaded");

        // 1️⃣ Upload to Pinata
        const formData = new FormData();
        formData.append("file", req.file.buffer, {
            filename: req.file.originalname
        });

        const pinataRes = await axios.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_KEY,
                },
            }
        );

        const ipfsHash = pinataRes.data.IpfsHash;

        // 2️⃣ Write to Blockchain
        const holder =
            req.body.holderAddress ||
            "0x0000000000000000000000000000000000000000";

        const tx = await contract.issueCertificate(ipfsHash, holder);
        await tx.wait();

        res.json({
            success: true,
            ipfsHash,
            txHash: tx.hash
        });

    } catch (error) {
        console.error("Issuance Error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =============================
// ROUTE: VERIFY CERTIFICATE
// =============================
app.post("/verify", async (req, res) => {
    try {
        const { ipfsHash } = req.body;

        if (!ipfsHash) {
            return res.status(400).json({
                success: false,
                error: "IPFS Hash is required"
            });
        }

        console.log("Received CID:", ipfsHash);

        const result = await contract.verifyCertificate(ipfsHash);

        console.log("Full result:", result);

        const isValid = result[0];
        const issuer = result[1];
        const date = result[2];

        res.json({
            isValid,
            issuer,
            date: date.toString()   // convert BigInt to string
        });

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// =============================
// START SERVER
// =============================
app.listen(5000, () =>
    console.log("🚀 Server running at http://localhost:5000")
);