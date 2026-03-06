let client;

module.exports = {
  setClient: (c) => {
    client = c;
  },
  getClient: () => client
};
