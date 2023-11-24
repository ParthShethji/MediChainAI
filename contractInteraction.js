const {Web3} = require("web3");

// Set up Web3 with the URL where Ganache is running
const ganacheUrl = "http://127.0.0.1:7545";
const web3 = new Web3(new Web3.providers.HttpProvider(ganacheUrl));

// Load your contract ABI and address
const contractAbi = require("./build/contracts/mediChainAI.json").abi;
const contractAddress = "0x72F7bD9b6DD2784c7966214522641752C9E30662"; // Replace with your contract's address

// Create a contract instance
const mediChainAIContract = new web3.eth.Contract(contractAbi, contractAddress);

// Interaction with the smart contract
async function createDocument(documentId, encryptionKey) {
  try {
      const accounts = await web3.eth.getAccounts();
      
      await mediChainAIContract.methods.createDocument(documentId, encryptionKey).send({ from: accounts[0] });
      console.log('Document created successfully');
  } catch (error) {
      console.error('Error creating document:', error);
  }
}

async function grantAccess(documentId, user) {
  try {
      const accounts = await web3.eth.getAccounts();
      console.log('Accounts:', accounts);
      console.log('Accounts:', accounts);
      
      await mediChainAIContract.methods.grantAccess(documentId, user).send({ from: accounts[0] });
      console.log('Access granted successfully');
      console.log('Transaction Hash:', transaction.transactionHash);
      console.log('Access granted successfully');
  
  } catch (error) {
      console.error('Error granting access:', error);
  }
}

async function revokeAccess(documentId, user) {
  try {
      const accounts = await web3.eth.getAccounts();
      await mediChainAIContract.methods.revokeAccess(documentId, user).send({ from: accounts[0] });
      console.log('Access revoked successfully');
  } catch (error) {
      console.error('Error revoking access:', error);
  }
}

async function getEncryptionKey(documentId) {
  try {
      const accounts = await web3.eth.getAccounts();
      const encryptionKey = await mediChainAIContract.methods.getEncryptionKey(documentId).call({ from: accounts[0] });
      console.log('Encryption Key:', encryptionKey);
  } catch (error) {
      console.error('Error getting encryption key:', error);
  }
}

module.exports = {
  createDocument,
  grantAccess,
  revokeAccess,
  getEncryptionKey,
};