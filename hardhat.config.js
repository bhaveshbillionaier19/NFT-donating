

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: "0.8.20",
  networks: {
    // qie testnet
    // qie: {
    //   type: "http",
    //   url: "https://rpc1testnet.qie.digital/",
    //   chainId: 1983,
    //   accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    // },
    //somnia test net 
    somniaTestnet: {
      type: "http",
      url: "https://dream-rpc.somnia.network/",
      chainId: 50312,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },

  },
};