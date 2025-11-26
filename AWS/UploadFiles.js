// const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
// const dotenv = require("dotenv");
// dotenv.config();

// const s3 = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_KEY,
//   },
// });

// const BUCKET_NAME = process.env.AWS_S3_BUCKET;

// const uploadFileToS3 = async (file, folder = "Awards") => {
//   const key = `${folder}/${Date.now()}-${file.originalname}`;
//   const command = new PutObjectCommand({
//     Bucket: BUCKET_NAME,
//     Key: key,
//     Body: file.buffer,
//     ContentType: file.mimetype,
//   });
//   await s3.send(command);
//   return key;
// };  

// const getPresignedUrl = async (key) => {
//   const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
//   const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
//   return url;
// };

// module.exports = { uploadFileToS3, getPresignedUrl };
