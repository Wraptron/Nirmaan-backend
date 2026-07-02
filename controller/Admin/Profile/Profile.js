const { ListAdminSingleFile } = require('../../../AWS/ListFiles');
const ProfileModel = require('../../../model/ProfileModel');
const { sendErrorResponse } = require('../../../utils/sendErrorResponse');

const Profile = async(req, res) => {
        try
        {
            const{mail} = req.params;
            const result = await ProfileModel(mail);
            res.send("d");
        } 
        catch(err)
        {
            sendErrorResponse(res, 500, 'Internal Server Error', err);
        }   
}

const ProfilePhoto = async(req, res) => {
    try 
    {
            const {mail} = req.query
            const result = await ProfileModel(mail);
            if(result.result.rows[0].user_role==2 && result.result.rows[0].user_department=='MANAGEMENT')
            {
                let key = result.result.rows[0].profile_photo;
                let dept = 'Admin'
                const response = await ListAdminSingleFile(key, dept);
                res.status(200).json({Key: response.Key})
            }
            else if(result.result.rows[0].user_role==3 && result.result.rows[0].user_department=='FINANCE')
            {
                let key = result.result.rows[0].profile_photo;
                let dept = 'Office'
                const response = await ListAdminSingleFile(key, dept)
                res.status(200).json({Key: response.Key});
            }
            else if(result.result.rows[0].user_role==5 && result.result.rows[0].user_department=='student')
            {
                let key = result.result.rows[0].profile_photo;
                let dept = 'Teams'
                const response = await ListAdminSingleFile(key, dept);
                res.status(200).json({Key: response.Key});
            }
            else
            {
                res.status(200).json(null);
            }
    }
    catch(err)
    {
        sendErrorResponse(res, 500, 'Internal Server Error', err);
    }
}
module.exports = {Profile, ProfilePhoto};
