// s3Upload.js
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const uploadToS3 = async (file) => {
  if (!file) return null;

  const bucketName = process.env.AWS_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("AWS_BUCKET_NAME is missing");
  }

  // Create the path inside bucket: Startups/profile/1710000-image.jpg
  const key = `Startups/${Date.now()}-${file.originalname}`.replace(/ /g, "+");

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const command = new PutObjectCommand(params);
  await s3.send(command);

  return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

module.exports = {uploadToS3};