const client = require('../utils/conn');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const bcrypt = require("bcrypt");
const { signAccessToken, signRefreshToken } = require('../utils/tokens');

const LoginModel = (user_mail, user_password) => {
    return new Promise((resolve, reject) => {
        client.query(
            `SELECT user_password, user_role, startup_id, mentor_id, user_name
             FROM user_data WHERE user_mail=$1`,
        [user_mail],
        (error, result) => {
            if (error) {
                reject(error);
            } else {
                if(result.rows.length > 0) {
                    const row = result.rows[0];
                    const storedPassword = row.user_password || "";
                    const isBcryptHash = storedPassword.startsWith("$2");
                    const passwordMatches = isBcryptHash
                      ? bcrypt.compareSync(user_password, storedPassword)
                      : storedPassword === user_password;

                    if (!passwordMatches) {
                      return resolve({ status: "User_not_found" });
                    }
                    const role = row.user_role;
                    const startup_id = row.startup_id;
                    const mentor_id = row.mentor_id;
                    const user_name = row.user_name;
                    const accessToken = signAccessToken(user_mail);
                    const refreshToken = signRefreshToken(user_mail);

                    resolve({
                        accessToken,
                        refreshToken,
                        role,
                        startup_id,
                        mentor_id,
                        user_name,
                        user_mail,
                        status: 'Login Authenticated',
                    });
                    
                } else {
                    resolve({ status: "User_not_found" });
                }
            }
        });
    });
};

module.exports = LoginModel;
