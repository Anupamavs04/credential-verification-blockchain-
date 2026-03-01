// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CredentialVerification {
    address public admin;

    // --- EVENTS (Important for Backend) ---
    event IssuerAdded(address indexed issuer);
    event CertificateIssued(string ipfsHash, address indexed issuer, address indexed holder);
    event CertificateRevoked(string ipfsHash);

    struct Certificate {
        address issuer;
        address holder;
        uint256 issueDate; // Added timestamp
        bool revoked;
        bool exists;       // To check if cert was ever created
    }

    mapping(address => bool) public issuers;
    // Changed mapping key to string for easier IPFS CID storage
    mapping(string => Certificate) public certificates;

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

    function addIssuer(address _issuer) public onlyAdmin {
        issuers[_issuer] = true;
        emit IssuerAdded(_issuer); // Trigger Event
    }

    function issueCertificate(string memory _ipfsHash, address _holder) public onlyIssuer {
        require(!certificates[_ipfsHash].exists, "Certificate already exists");

        certificates[_ipfsHash] = Certificate(
            msg.sender,
            _holder,
            block.timestamp, // Stores the current time
            false,
            true
        );

        emit CertificateIssued(_ipfsHash, msg.sender, _holder); // Trigger Event
    }

    function revokeCertificate(string memory _ipfsHash) public onlyIssuer {
        require(certificates[_ipfsHash].exists, "Certificate not found");
        require(certificates[_ipfsHash].issuer == msg.sender, "Only the original issuer can revoke");

        certificates[_ipfsHash].revoked = true;
        emit CertificateRevoked(_ipfsHash); // Trigger Event
    }

    function verifyCertificate(string memory _ipfsHash) public view returns (bool isValid, address issuer, uint256 date) {
        Certificate memory cert = certificates[_ipfsHash];
        
        // Returns more data so the frontend looks better
        return (
            (cert.exists && !cert.revoked),
            cert.issuer,
            cert.issueDate
        );
    }
}