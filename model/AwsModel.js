const aws = require('aws-sdk');
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const multer = require('multer');
const multers3 = require("multer-s3");
const fs = require('fs');
aws.config.update({
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    accessKeyId:process.env.AWS_ACCESS_KEY,
    region:process.env.REGION
})
const s3= new aws.S3();
const AwsModel = async(filename) => 
{

    const fileStream = fs.createReadStream(filename.path);
    const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `Mentor/${filename.originalname}`,
        Body: fileStream,
        //ACL: 'public-read',
        ContentType: filename.mimetype,
    };
    try {
        const result = await s3.upload(uploadParams).promise();
        return result.Location;
      } catch (error) {
        console.error("Upload error:", error);
        throw error;
    }
}
module.exports = {AwsModel};