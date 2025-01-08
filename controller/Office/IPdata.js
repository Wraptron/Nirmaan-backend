const AWS = require('aws-sdk')
const S3 = AWS.S3;
const { PassThrough } = require('stream');
let credentials = {
    accessKeyId: '',
    secretAccessKey: ''
}
let region = 'ap-south-1'
let signatureVersion= 'v4'
const s3 = new S3({
    credentials,
    region,
    signatureVersion
})
const  IPdataUpload = async (req, res) => {
   const {team_name, team_head_data, team_phone_number, email_address, team_description, team_vision, team_mission, current_status} = req.body;
   const data = req?.file || null;
   try
   {
        console.log(data);
        res.send(team_name)
   }
   catch(err)
   {
    console.log(err)
   }
//    if(data)
//    {
//         res.send("Got the file");
//    }
//    else
//    {
//         res.send("Not working");
//    }
   //res.send(team_name);
}
module.exports = IPdataUpload;