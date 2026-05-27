const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { ACCESS_TOKEN_COOKIE } = require('./authCookies');
const getUserAuthContext = require('../model/getUserAuthContext');

const Authenticate = async (req, res, next) => {
    const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
    if (!token) {
        return res.status(401).json({ status: 'Unauthorized: No token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userMail = decoded.sub;
        if (!userMail) {
            return res.status(403).json({
                message: 'Invalid token payload',
                status: 'Forbidden: Invalid token',
            });
        }

        const user = await getUserAuthContext(userMail);
        if (!user) {
            return res.status(403).json({
                message: 'User not found',
                status: 'Forbidden: Invalid token',
            });
        }

        req.user = user;
        next();
    } catch (err) {
        const message =
            err.name === 'TokenExpiredError'
                ? 'Session expired. Please log in again.'
                : 'Invalid or expired token.';
        return res.status(403).json({
            message,
            status: 'Forbidden: Invalid token',
        });
    }
};

module.exports = Authenticate;
