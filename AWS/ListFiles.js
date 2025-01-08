const AWS = require('aws-sdk');
require('dotenv').config
const S3 = AWS.S3;
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

const ListAdminFiles = async() => {
    try{
        const response = await s3.listObjectsV2({
              Bucket: 'trktorrr',
              Prefix: 'Admin'
        }).promise()
        console.log(response.Contents.Key);
    }
    catch(e)
    {
        console.log(e);
    }
    debugger;
}

const ListOfficeFiles = async() => {
    try {
        const response = await s3.listObjectsV2({
            Bucket: 'trktorrr',
            Prefix: 'Office'
        }).promise()

        console.log(response); 
    }
    catch(err)
    {
        console.log(err)
    }
    //debugger;
}

const ListTeamsFiles = async() => {
    try {
        const response = await s3.listObjectsV2({
            Bucket: 'trktorrr',
            Prefix: 'Teams'
        }).promise()

        console.log(response); 
    }
    catch(err)
    {
        console.log(err)
    }
}
const ListMentorFiles = async() => {
    try {
        const response = await s3.listObjectsV2({
            Bucket: 'trktorrr',
            Prefix: 'Mentor'
        }).promise()

        console.log(response); 
    }
    catch(err)
    {
        console.log(err)
    }
}
const ListAdminSingleFile = async(key, dept) => {
    try{
        const response = await s3.listObjectsV2({
              Bucket: 'trktorrr',
              Prefix: dept,
        }).promise()

        //return response
        const matchingObject = response.Contents.find(obj => obj.Key === key);

        if (matchingObject) {

            return matchingObject;
            //console.log(matchingObject);
    
        } else {
    
            return null; // Object not found
            //console.log('no');
        }
    }
    catch(e)
    {
        return e
    }
    debugger;
}

///ListAdminSingleFile('Office/39529.jpg', 'Office')
module.exports = {ListAdminFiles, ListOfficeFiles, ListTeamsFiles, ListMentorFiles, ListAdminSingleFile}
//ListMentorFiles()
//ListAdminFiles()
//module.exports = ListAdminFiles;