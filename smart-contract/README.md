Smart Contract – Credential Verification System

Multi-University Certificate Verification using Blockchain

 Description
This smart contract is developed.
It enables secure issuance, revocation, and verification of academic
credentials using blockchain.

Only authorized users can perform sensitive actions using access control.

 Technology Used
- Language: Solidity (v0.8.0)
- IDE: Remix Ethereum
- Network: Remix VM (Test Environment)

 Smart Contract File
- CredentialVerification.sol

 User Roles
  1. Admin
  - Deploys the contract
  - Adds authorized issuers

 2. Issuer (University/Institution)
  - Issues certificates
  - Revokes certificates

 3. Holder (Student)
  - Holds the credential off-chain (IPFS)

 4. Verifier (Employer/Agency)
  - Verifies certificate validity

      Data Structure

 Certificate Structure
Each certificate contains:
 - Issuer address
 - Holder address
 - Revocation status

   solidity
  struct Certificate {
    address issuer;
    address holder;
    bool revoked;
 }



  
pragma solidity ^0.8.0;

contract CredentialVerification {

    address public admin;
   
    mapping(address => bool) public issuers;

    struct Certificate {
        address issuer;   // Institution that issued certificate
        address holder;   // Student / holder address
        bool revoked;     // Revocation status
    }

    mapping(bytes32 => Certificate) public certificates;

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
    }

    function issueCertificate(bytes32 _hash, address _holder) public onlyIssuer {

        require(certificates[_hash].issuer == address(0),
                "Certificate already exists");

        certificates[_hash] = Certificate(
            msg.sender,
            _holder,
            false
        );
    }

    function revokeCertificate(bytes32 _hash) public onlyIssuer {

        require(certificates[_hash].issuer != address(0),
                "Certificate not found");

        certificates[_hash].revoked = true;
    }
    function verifyCertificate(bytes32 _hash)
        public
        view
        returns (bool)
    {
        return (
            certificates[_hash].issuer != address(0) &&
            !certificates[_hash].revoked
        );
    }

}
