const AWS = require('aws-sdk');
require('dotenv').config
const S3 = AWS.S3();
let credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
}
let region = 'ap-south-1'
let signatureVersion= 'v4'
const s3 = new S3({
    credentials,
    region,
    signatureVersion
})



