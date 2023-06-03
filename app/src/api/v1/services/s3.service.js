const fs = require('fs');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: 'AKIAX4PAJC2HA3OXCVNE',
    secretAccessKey: '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'
});




const uploadAudio = async (fileData) => {
    const blob = fs.readFileSync(fileData.path)
    const params = {
        Bucket: 'audio-bucket-dev-nikit', // pass your bucket name
        Key: 'audio/' + fileData.filename, // file will be saved as testBucket/contacts.csv
        Body: blob
    };
    const data = await s3.upload(params).promise();
    fs.unlinkSync(fileData.path)
    return data
};

const uploadImage = async (fileData) => {
    const blob = fs.readFileSync(fileData.path)
    const params = {
        Bucket: 'audio-bucket-dev-nikit', // pass your bucket name
        Key: 'image/' + fileData.filename, // file will be saved as testBucket/contacts.csv
        Body: blob
    };
    const data = await s3.upload(params).promise();
    fs.unlinkSync(fileData.path)
    return data
};
module.exports = { uploadAudio, uploadImage };