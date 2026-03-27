// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 1. Import the Verifier contract you generated with snarkjs
import "./Verifier.sol";

// 2. "is Groth16Verifier" links your logic to the ZK math
contract CredentialVerification is Groth16Verifier {
    address public admin;

    // --- EVENTS ---
    event IssuerAdded(address indexed issuer);
    event CertificateIssued(string ipfsHash, address indexed issuer, address indexed holder);
    event CertificateRevoked(string ipfsHash);

    struct Certificate {
        address issuer;
        address holder;
        uint256 issueDate;
        bool revoked;
        bool exists;
    }

    mapping(address => bool) public issuers;
    mapping(string => Certificate) public certificates;

    // A mapping to store the Poseidon hashes (Public Signals) of issued certificates
    mapping(uint256 => bool) public zkRoots;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyIssuer() {
        require(issuers[msg.sender], "Only authorized issuer allowed");
        _;
    }

    // Admin adds a University/Issuer
    function addIssuer(address _issuer) public onlyAdmin {
        issuers[_issuer] = true;
        emit IssuerAdded(_issuer);
    }

    // Issues a certificate with both a public IPFS hash and a private ZK Root
    function issueCertificate(string memory _ipfsHash, address _holder, uint256 _zkRoot) public onlyIssuer {
        require(!certificates[_ipfsHash].exists, "Certificate already exists");

        certificates[_ipfsHash] = Certificate(
            msg.sender,
            _holder,
            block.timestamp,
            false,
            true
        );
        
        // Store the Poseidon hash so the ZK Proof can be verified against it later
        zkRoots[_zkRoot] = true;

        emit CertificateIssued(_ipfsHash, msg.sender, _holder);
    }

    function revokeCertificate(string memory _ipfsHash) public onlyIssuer {
        require(certificates[_ipfsHash].exists, "Certificate not found");
        require(certificates[_ipfsHash].issuer == msg.sender, "Only issuer can revoke");

        certificates[_ipfsHash].revoked = true;
        emit CertificateRevoked(_ipfsHash);
    }

    // --- ZK PROOF VERIFICATION ---
    // Uses 'calldata' to match the Verifier.sol requirements
    function verifyZkProof(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[1] calldata input // input[0] is the blockchainRoot (Poseidon hash)
    ) public view returns (bool) {
        
        // 1. Call the internal verifyProof function from Verifier.sol
        bool proofValid = verifyProof(a, b, c, input);
        require(proofValid, "Invalid ZK Proof: The math does not check out");

        // 2. Check if this specific Root exists in our issued mapping
        require(zkRoots[input[0]], "This certificate hash was never registered on-chain");

        return true;
    }

    // Standard Public Verification
    function verifyCertificate(string memory _ipfsHash) public view returns (bool isValid, address issuer, uint256 date) {
        Certificate memory cert = certificates[_ipfsHash];
        return ( (cert.exists && !cert.revoked), cert.issuer, cert.issueDate );
    }
}