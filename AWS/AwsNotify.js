const AWS = require('aws-sdk');


const Creds = new AWS.SharedIniFileCredentials({profile: 'default'});


const sns = new AWS.SNS({creds, region: 'ap-south-1'})