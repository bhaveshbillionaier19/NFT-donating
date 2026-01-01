

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: "0.8.20",
  networks: {
    qie: {
      type: "http",
      url: "https://rpc1testnet.qie.digital/",
      chainId: 1983,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};