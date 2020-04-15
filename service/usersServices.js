module.exports = userRepository => {
  return {
    getAllUser: () => {
      return userRepository.getAllUsers();
    }
  };
};
