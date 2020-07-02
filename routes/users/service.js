const repository = require("../auth/repository");

module.exports = repository => {
  return {
    getAllUsers: () => {
      return repository.getAllUsers();
    }
  };
};