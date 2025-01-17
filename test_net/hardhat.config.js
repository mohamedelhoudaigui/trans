require("@nomicfoundation/hardhat-toolbox");

PORT = process.env.WEB3_PORT
URL = "http://localhost:" + PORT

module.exports = {
  networks: {
    localhost: {
      url: URL
    }
  }
};
