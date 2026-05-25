const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const Authenticate = (req, res, next) => {
     const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ status: 'Unauthorized: No token' });
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                const message =
                    err.name === "TokenExpiredError"
                        ? "Session expired. Please log in again."
                        : "Invalid or expired token.";
                return res.status(403).json({
                    message,
                    status: "Forbidden: Invalid token",
                });
            }
            req.user = user;
            next();
        });
}
module.exports = Authenticate;