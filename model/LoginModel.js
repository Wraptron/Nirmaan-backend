const client = require('../utils/conn');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const nodeCache = require('node-cache');
const bcrypt = require("bcrypt");

const LoginModel = (user_mail, user_password) => {
    const cache = new nodeCache();
    
    return new Promise((resolve, reject) => {
        client.query('SELECT * FROM user_data WHERE user_mail=$1',
        [user_mail],
        (error, result) => {
            if (error) {
                reject(error);
            } else {
                if(result.rows.length > 0) {
                    const userData = result.rows[0];
                    const storedPassword = userData.user_password || "";
                    const isBcryptHash = storedPassword.startsWith("$2");
                    const passwordMatches = isBcryptHash
                      ? bcrypt.compareSync(user_password, storedPassword)
                      : storedPassword === user_password;

                    if (!passwordMatches) {
                      return resolve({ status: "User_not_found" });
                    }
                    const role = userData.user_role;
                    const department = userData.user_department;
                    const startup_id = userData.startup_id
                    const mentor_id = userData.mentor_id
                    // Create JWT token
                    const accessToken = jwt.sign(
                        { user_mail: user_mail, role: role,startup_id:startup_id,mentor_id:mentor_id }, 
                        process.env.ACCESS_TOKEN_SECRET, 
                        { expiresIn: '30m' }
                    );
                    
                    // Determine authentication level based on role
                    let authenticationLevel;
                    switch(role) {
                        case 1:
                            authenticationLevel = "Finance";
                            break;
                        case 2:
                            authenticationLevel = "Admin";
                            break;
                        case 3:
                            authenticationLevel = "Finance";
                            break;
                        case 5:
                            authenticationLevel = "Student";
                            break;
                        case 6:
                            authenticationLevel = "Mentor";
                            break;
                        default:
                            authenticationLevel = "Unknown";
                    }
                    
                    // Return single resolve with all data
                    resolve({
                        accessToken: accessToken,
                        id: user_mail,
                        role: role,
                        department: department,
                        status: 'Login Authenticated',
                        authenticationLevel: authenticationLevel,
                        userData: userData,
                        startup_id:startup_id,
                        mentor_id:mentor_id
                    });
                    
                } else {
                    resolve({ status: "User_not_found" });
                }
            }
        });
    });
};

module.exports = LoginModel;