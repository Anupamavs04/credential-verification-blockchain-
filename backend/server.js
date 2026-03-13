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

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const contractAddress = process.env.CONTRACT_ADDRESS;

// ABI - UPDATED TO MATCH YOUR SOL FILE EXACTLY
const contractABI = [
    "function addIssuer(address _issuer) public",
    "function issueCertificate(string _ipfsHash, address _holder) public",
    "function verifyCertificate(string _ipfsHash) public view returns (bool isValid, address issuer, uint256 date)"
];

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// ROUTE: AUTHORIZE (Matches your 'addIssuer' function)
app.post("/approve-institution", async (req, res) => {
    try {
        const { address } = req.body; 
        console.log(`Admin: Authorizing address ${address}`);

        // This calls your 'addIssuer' function in Solidity
        const tx = await contract.addIssuer(address); 
        await tx.wait();

        res.json({ success: true, txHash: tx.hash });
    } catch (error) {
        console.error("Approval Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ROUTE: ISSUE
app.post("/issue", upload.single("certificate"), async (req, res) => {
    try {
        if (!req.file) throw new Error("No file uploaded");

        const formData = new FormData();
        formData.append("file", req.file.buffer, { filename: req.file.originalname });

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
        const holder = req.body.holderAddress || "0x0000000000000000000000000000000000000000";
        
        const tx = await contract.issueCertificate(ipfsHash, holder);
        await tx.wait();

        res.json({ success: true, ipfsHash, txHash: tx.hash });
    } catch (error) {
        console.error("Issuance Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ROUTE: VERIFY
app.post("/verify", async (req, res) => {
    try {
        const { ipfsHash } = req.body;
        const result = await contract.verifyCertificate(ipfsHash);
        res.json({
            isValid: result[0],
            issuer: result[1],
            date: result[2].toString()
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(5000, () => console.log("🚀 Server running at http://localhost:5000"));