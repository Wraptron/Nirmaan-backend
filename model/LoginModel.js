const client = require('../utils/conn');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const bcrypt = require("bcrypt");
const { signAccessToken, signRefreshToken } = require('../utils/tokens');

const LoginModel = async (user_mail, user_password) => {
    const result = await client.query(
        `SELECT user_password, user_role, startup_id, mentor_id, user_name
         FROM user_data WHERE user_mail=$1`,
        [user_mail]
    );

    if (result.rows.length === 0) {
        return { status: "Invalid credentials, please check your email and password" };
    }

    const row = result.rows[0];
    const storedPassword = row.user_password;

    if (!storedPassword || !storedPassword.startsWith("$2")) {
        console.warn("Non-bcrypt password encountered for user:", user_mail);
        return { status: "Invalid credentials, please check your email and password" };
    }

    const passwordMatches = await bcrypt.compare(user_password, storedPassword);

    if (!passwordMatches) {
        return { status: "Invalid credentials, please check your email and password" };
    }

    const role = row.user_role;
    const startup_id = row.startup_id;
    const mentor_id = row.mentor_id;
    const user_name = row.user_name;
    const accessToken = signAccessToken(user_mail);
    const refreshToken = signRefreshToken(user_mail);

    return {
        accessToken,
        refreshToken,
        role,
        startup_id,
        mentor_id,
        user_name,
        user_mail,
        status: 'Login Authenticated',
    };
};

module.exports = LoginModel;
