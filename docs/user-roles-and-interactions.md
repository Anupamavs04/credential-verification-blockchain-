# User Roles and System Interactions

This document describes the different user roles in the credential verification system and how they interact with each other.

---

1. Admin
 Responsibilities
- Approve and manage Issuers
- Monitor system activity
- Maintain security policies
Interactions
- Approves Issuers through smart contracts
- Views system logs and reports
- Controls access permissions

2. Issuer (University / Institution)
Responsibilities
- Issue digital certificates
- Upload certificate files to IPFS
- Store certificate hash on blockchain
- Revoke certificates if required
Interactions
- Uploads certificate → IPFS
- Stores CID → Blockchain
- Issues credential to Holder

3. Holder (Student / Professional)
Responsibilities
- Store issued certificates
- Manage access to credentials
- Share verification proofs
Interactions
- Views credentials via dashboard
- Generates verification link / QR code
- Shares proof with Verifier

4. Verifier (Employer / Organization)
Responsibilities
- Verify authenticity of certificates
- Validate issuer identity
Interactions
- Requests credential proof
- Retrieves file from IPFS
- Verifies hash from blockchain

 5. Blockchain Network
 Responsibilities
- Maintain immutable records
- Enforce smart contract rules
Interactions
- Stores certificate hashes
- Executes verification logic
- Maintains revocation registry

 Interaction Summary

Admin → Approves → Issuer  
Issuer → Issues → Holder  
Holder → Shares → Verifier  
Verifier → Verifies → Blockchain  
Blockchain → Confirms → Verifier
