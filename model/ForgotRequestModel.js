const client = require('../utils/conn');
const nodemailer = require('nodemailer');
const ForgotPasswordEmailer = require("../components/ForgotPasswordEmailer");
// const {sendEmail} = require("../utils/SendEmail")
const ForgotRequestModel = (email_prompt) => {
    return new Promise((resolve, reject)=>{
        client.query('SELECT user_mail FROM user_data WHERE user_mail=$1', [email_prompt], (err, result)=>{
            if(err)
            {
                reject(err)
            }
            else
            {
                if(result.rows.length > 0)
                {
                    try
                    {
                    //    const emailData = sendEmail('oiecloud2024@gmail.com', 'RE: Reset Password Request')
                    //    resolve(emailData);

                    }
                    catch(err)
                    {
                        console.log(err);
                    }
                    //resolve({Status: 'Exits'});

                }
                else
                {
                    resolve({Email_status: "Email does not exist! please provide valid email address"})
                }
            }
        })
    })
}
module.exports = ForgotRequestModel;