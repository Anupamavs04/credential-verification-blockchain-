# 🛡️ Credential Verification Using Blockchain
**Internship project at Kerala Blockchain Academy**

An end-to-end platform for issuing and verifying academic credentials using **Zero-Knowledge Proofs (ZKP)** and **IPFS**.

## 🚀 Project Overview
This project solves the issue of credential fraud by allowing institutions to issue digital fingerprints on-chain. Students can prove ownership of their certificates via ZK-SNARKs without revealing private data.

## 🛠️ Tech Stack
- **ZKP Logic:** Circom 2.0 & SnarkJS
- **Blockchain:** Solidity / Hardhat / Localhost
- **Storage:** IPFS Hashing
- **Frontend:** React / Ethers.js / MetaMask

## 📖 How to Run
1. Start node: `npx hardhat node`
2. Deploy: `npx hardhat run scripts/deploy.js --network localhost`
3. Verify: `npx hardhat run scripts/verify-on-chain.js --network localhost`