module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Host where Ganache is running
      port: 7545, // Port number for Ganache (default is 7545)
      network_id: "*", // Match any network id
    },
  },
  contracts_build_directory: "./build/contracts", // Path to contract build artifacts
  compilers: {
    solc: {
      version: "0.8.0", // Use the Solidity version you want
    },
  },
};
