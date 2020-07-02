module.exports = repository => {
  return {
    getAllUsers: () => {
      return repository.getAllUsers();
    },

    findUser: (field, value) => {
      // console.log('finding user --> ', field, value)
      return repository.findUser(field, value);
    },

    createUserWithEmailPW: async (user) => {
        const result = await repository.createUserWithEmailPW(user);
        const newUser = result.rows[0];
        // console.log('NEW USER ==> ', newUser);
        return newUser;
    },

    authWith_g_id: async (profile) => {
      const result = await repository.findUser("google_id", profile.id);
      let existingUser = result.rows[0];
      if (!existingUser) {
        const result = await repository.createUserWith_g_profile(profile);
        const newUser = result[0];
        return newUser;
      } else {
        return existingUser;
      }
    }
  }
}