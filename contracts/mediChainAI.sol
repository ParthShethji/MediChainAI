// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract mediChainAI {
    struct Document {
        bytes encryptionKey;
        bool accessGranted;
    }

    mapping(string => Document) documents;
    mapping(string => address) documentOwners; // Mapping to track document owners
    mapping(address => mapping(string => bool)) userDocumentAccess;

    event AccessGranted(address indexed user, string documentId);
    event AccessRevoked(address indexed user, string documentId);

    modifier onlyDocumentOwner(string memory documentId) {
        require(msg.sender == documentOwners[documentId], "Only the document owner can perform this action");
        _;
    }

    constructor(){
        // Constructor to initialize the contract
    }

    function createDocument(string memory documentId, bytes memory encryptionKey) public {
        require(documents[documentId].encryptionKey.length == 0, "Document with the same ID already exists");
        documents[documentId] = Document({
            encryptionKey: encryptionKey,
            accessGranted: false
        });
        documentOwners[documentId] = msg.sender; // Set the document owner
    }

    function grantAccess(string memory documentId, address user) public onlyDocumentOwner(documentId) {
        require(!documents[documentId].accessGranted, "Access is already granted for this document");
        userDocumentAccess[user][documentId] = true;
        documents[documentId].accessGranted = true;
        emit AccessGranted(user, documentId);
    }

    function revokeAccess(string memory documentId, address user) public onlyDocumentOwner(documentId) {
        require(documents[documentId].accessGranted, "Access is not granted for this document");
        userDocumentAccess[user][documentId] = false;
        documents[documentId].accessGranted = false;
        emit AccessRevoked(user, documentId);
    }

    function getEncryptionKey(string memory documentId) public view returns (bytes memory) {
        require(userDocumentAccess[msg.sender][documentId] || msg.sender == documentOwners[documentId], "Access denied");
        return documents[documentId].encryptionKey;
    }
}
