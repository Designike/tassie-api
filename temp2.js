// require('dotenv').config();
// const AWS = require('aws-sdk');
// const fs = require('fs');
// const { google } = require('googleapis');
// const path = require('path');
// // const fs = require('fs');
// const stream = require('stream');
// const { v4: uuidv4 } = require("uuid");
// const { response } = require('express');
// // const AWS = require('aws-sdk');
// const bucketName = process.env.AWS_BUCKET_NAME
// const accessKeyId = process.env.AWS_ID
// const secretAccessKey = process.env.AWS_SECRET

// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ID,
//   secretAccessKey: process.env.AWS_SECRET
// })

// const uploadPost = async (uuid, file) =>  {
//   const fileStream = fs.createReadStream(file)
//   const name = "posts/" + uuid + "/" + uuid +'_post_' + uuidv4() + ".jpg";

//   const uploadParams = {
//     Bucket: bucketName,
//     Body: fileStream,
//     Key: name
//   }

//   return s3.upload(uploadParams).promise().then(res => {console.log(res);})
// }

// const uploadRecipe = async (uuid, file, recipeUuid, suffixName) =>  {
//   const fileStream = fs.createReadStream(file.path)
//   const name = "recipes/" + uuid + "/" + recipeUuid + "/" + suffixName + path.extname(file.originalname);

//   const uploadParams = {
//     Bucket: bucketName,
//     Body: fileStream,
//     Key: name
//   }

//   return s3.upload(uploadParams).promise()}

// // downloads a file from s3
// const getFileStream = async (req, res) => {
//     const fileKey = req.body.key;
//     const downloadParams = {
//         Key: fileKey,
//         Bucket: bucketName
//     }
//     // console.log(downloadParams);

//   s3.getObject(downloadParams).createReadStream().pipe(res);
// }



// // router.delete("/deleteFile",(req,res)=>{
// //     s3.deleteFileFromS3('horizontal_tagline_on_white_by_logaster.jpeg',(error,data)=>{
// //         if(error){
// //             return res.send({error:"Can not delete file, Please try again later"});
// //         }
// //         return res.send({message:"File has been deleted successfully"});
// //     });
// // });

// // const deleteFile = async (key) => {
// //   try {
// //     const deleteParams = {
// //       Key:key,
// //       Bucket: bucketName
// //     };
    
// //      s3.deleteObject(deleteParams).promise();
// //      return {status: true};
// //   } catch (error) {
// //     return {error: error, status: false};
// //   }
// // }


// module.exports = {
//     getFileStream
// }

