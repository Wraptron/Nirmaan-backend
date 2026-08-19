const aws = require('aws-sdk');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const GetAlldataModel = async () => {
    try {
        const bucketName = process.env.AWS_S3_BUCKET;
        if (!bucketName) {
            throw new Error("AWS_S3_BUCKET is missing");
        }
        aws.config.update({
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
            accessKeyId: process.env.AWS_ACCESS_KEY,
            region: process.env.REGION
        });
        const s3 = new aws.S3();
        const listObjectsParams = {
            Bucket: bucketName
        };
        const data = await s3.listObjectsV2(listObjectsParams).promise();
        const objectKeys = data.Contents.map(item => item.Key);
        return objectKeys
    } catch (error) {
        return error;
    }
};

module.exports = GetAlldataModel;
