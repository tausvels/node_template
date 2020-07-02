module.exports = db => {
  return {
    getAllUsers: () => {
      const qs = `SELECT * FROM users;`;
      return db.query(qs);
    },

    findUser: (field, value) => {
      const qs = "SELECT * FROM users WHERE " + field + " = $1 ;";
      // const qs = `SELECT * FROM users WHERE ${field}='${value}';`
      return db.query(qs,[value]);
    },

    findUserWith_g_id: (g_id) => {
      const qs = `SELECT * FROM users WHERE google_id = $1 ;`;
      return db.query(qs, [g_id]);
    },

    createUserWithEmailPW: (user) => {
      const email = user.email;
      const password = user.password;
      const userName = user.userName || user.firstName || 'Anonymous';
      const confirmed = true;
      const qs = `INSERT INTO users(email, password, username, confirmed) VALUES ($1, $2, $3, $4) RETURNING *;`;
      return db.query(qs, [email, password, userName, confirmed]);
    },

    createUserWith_g_profile: (profile) => {
      const user = profile._json;
      const userName = user.name;
      const email = user.email;
      const google_id = user.sub;
      const photo = user.picture;
      const qs = `INSERT INTO users (username, email, google_id, photo) VALUES ($1, $2, $3, $4) RETURNING *`;
      return db.query(qs, [userName, email, google_id, photo]);
    }

  }
}