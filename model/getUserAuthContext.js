const client = require("../utils/conn");

const getUserAuthContext = (userMail) =>
  new Promise((resolve, reject) => {
    client.query(
      `SELECT user_mail, user_role, startup_id, mentor_id, user_name
       FROM user_data WHERE user_mail = $1`,
      [userMail],
      (error, result) => {
        if (error) return reject(error);
        if (!result.rows.length) return resolve(null);
        const row = result.rows[0];
        resolve({
          user_mail: row.user_mail,
          role: row.user_role,
          startup_id: row.startup_id,
          mentor_id: row.mentor_id,
          user_name: row.user_name,
        });
      }
    );
  });

module.exports = getUserAuthContext;
