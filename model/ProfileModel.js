const client = require('../utils/conn');
const ProfileModel = async(mail) => {
    return new Promise((resolve, reject)=>{
        client.query("SELECT personal_email, user_contact, user_department, user_id, user_mail, user_role, user_name, profile_photo FROM user_data WHERE user_mail=$1",[mail], (err, result)=>{
            if(err)
            {
                reject(err)
            }
            else
            {
                if(result.rows.length > 0)
                {
                    resolve({result});
                }
                else {
                    reject(new Error("No data found")); // Reject if no rows found
                }
            }
        })
    })
}
module.exports = ProfileModel;