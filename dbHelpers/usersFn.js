const addNewUser = (db, user) => {
  let qsParam = [user.name, user.email, user.google_id, user.photoURL];
  let qs = `
    INSERT INTO users (name, email, google_id, photoURL) 
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `
  return db.query(qs, qsParam)
  .then(res => res.rows[0])
  .catch(e => console.error(e));
};

exports.addNewUser = addNewUser;

const getUserByGoogleId = (db, google_id) => {
  let qsParam = [google_id];
  let qs = `
    SELECT * 
    FROM users
    WHERE google_id = $1;
  `
  return db.query(qs, qsParam)
  .then(res => res.rows[0])
  .catch(e => console.error(e));
};

exports.getUserByGoogleId = getUserByGoogleId;