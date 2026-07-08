const nodemailer = require("nodemailer");
const path = require('path');  
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const ApprovalRequest = async(req, res) => {
    const {college_data, college_department, resume_url, resume_year, resume_name} = req.body;
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "prasathnarayanan6@gmail.com",
            pass: process.env.PASS_KEY
        },
    });
}
module.exports = ApprovalRequest