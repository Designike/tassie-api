require('dotenv').config();

// const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
// const stream = require('stream');
const { v4: uuidv4 } = require("uuid");
// const { response } = require('express');
const AWS = require('aws-sdk');

// const oauth2Client = new google.auth.OAuth2(
//     process.env.CLIENT_ID,
//     process.env.CLIENT_SECRET,
//     process.env.REDIRECT_URI
// );

// oauth2Client.setCredentials({refresh_token:process.env.REFRESH_TOKEN});

// const drive = google.drive({
//     version:'v3',
//     auth:oauth2Client
// });


// const filePath = path.join(__dirname,'designike_logo.png');

// const uploadFil = (req,res) => {
//     console.log(req.body);
//     console.log(req.image);
//     console.log(req.body.image);
//     console.log(req.file);
//     // upload(req,res,req.file);
//     res.status(201).json({
//       status: true,
//       message: "done",
//       errors: [],
//       data: {},
//     });
    
// }

// const drivePostUpload = async (uuid, file, folder) => {
//   try {
//     const name = uuid+'_post_' + uuidv4();
//     var fileMetadata = {
//       'name': name + path.extname(file.originalname),
//       parents: [folder]
//     };
//     const response = await drive.files.create({
//       media:{
//           mimeType: file.mimeType,
//           body: fs.createReadStream(file.path),
//       }, 
//       resource : fileMetadata
//     })
//     return {response: response.data, status: true, filename: name};
//   } catch (error) {
//     return {error: error, status: false};
//   }

// }

// const driveRecipeUpload = async (suffixName, file, folder) => {
//   try {
//     // const name = uuid + suffixName;
//     var fileMetadata = {
//       'name': suffixName + path.extname(file.originalname),
//       parents: [folder]
//     };
//     const response = await drive.files.create({
//       media:{
//           mimeType: file.mimeType,
//           body: fs.createReadStream(file.path),
//       }, 
//       resource : fileMetadata
//     })
//     return {response: response.data, status: true};
//   } catch (error) {
//     return {error: error, status: false};
//   }

// }

// const createFolder = async (folderName, isPost) => {
//   try {
//     let parent = isPost ? process.env.POST_FOLDER : process.env.RECIPE_FOLDER;
//     var fileMetadata = {
//       'name': folderName,
//       'mimeType': 'application/vnd.google-apps.folder',
//       parents: [parent]
//     };
//     const response = await drive.files.create({
//       resource: fileMetadata,
//       fields: 'id'
//     })
//     return {response: response.data, status: true};
//   } catch (error) {
//     return {error: error, status: false};
//   }
 
// }


// const createRecipeFolder = async (folderName, parent) => {
//   try {
//     var fileMetadata = {
//       'name': folderName,
//       'mimeType': 'application/vnd.google-apps.folder',
//       parents: [parent]
//     };
//     const response = await drive.files.create({
//       resource: fileMetadata,
//       fields: 'id'
//     })
//     return {response: response.data, status: true};
//   } catch (error) {
//     return {error: error, status: false};
//   }
 
// }
// const uploadFile = async (uuid, file) => {
//     try{
//         await driveUpload(req.user.uuid, file);

//         if(result.status == true){
//         res.status(201).json({
//             status: true,
//             message: "done",
//             errors: [],
//             data: {},
//           });
//         }
//         else{
//             res.status(201).json({
//                 status: false,
//                 message: "error 1",
//                 errors: [],
//                 data: {},
//               });
//         }
//     }catch(err){
//         console.log(err);
//         res.status(201).json({
//             status: false,
//             message: "error 2",
//             errors: [],
//             data: {},
//           });
//     }
// }

// uploadFile();
// const deleteFile = async (fileId) => {
//   try {
//     const response = await drive.files.delete({
//       fileId: fileId,
//     })
//     return {response: response.data, status: true};
//   } catch (error) {
//     return {error: error, status: false}
//   }
// }

  // deleteFile();
  
// const generatePublicUrl = async (fileId) => {
//   try {
//     await drive.permissions.create({
//       fileId: fileId,
//       requestBody: {
//         role: 'reader',
//         type: 'anyone',
//       },
//     })
//     const response = await drive.files.get({
//       fileId: fileId,
//       fields: 'webContentLink',
//     })
//     return {response: response.data, status: true};
//   } catch (error) {
//     return {error: error, status: false}
//   }   

// }
  
const bucketName = process.env.AWS_BUCKET_NAME
const accessKeyId = process.env.AWS_ID
const secretAccessKey = process.env.AWS_SECRET

const s3 = new AWS.S3({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey
})

const s3_2 = new AWS.S3({
  signatureVersion: 'v4',
  region:'ap-south-1',
  accessKeyId: process.env.AWS_ID_2,
  secretAccessKey: process.env.AWS_SECRET_2
})

const uploadPost = async (uuid, file) =>  {
  try {
    const fileStream = fs.createReadStream(file.path)
    const newUuid = uuidv4();
    const postUuid = uuid +'_post_' + newUuid
    const name = "posts/" + uuid + "/" + postUuid + path.extname(file.originalname);

    const uploadParams = {
      Bucket: bucketName,
      Body: fileStream,
      Key: name
    }

    const response = await s3.upload(uploadParams).promise();
      return {response: response.Key, status: true, filename: postUuid};
    
    // console.log(response);
  } catch (error) {
    return {error: error, status: false};
  }
  
}

const uploadRecipe = async (uuid, file, recipeUuid, suffixName) =>  {
  try {
  
  const fileStream = fs.createReadStream(file.path)
  const name = "recipes/" + uuid + "/" + recipeUuid + "/" + suffixName + path.extname(file.originalname);

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: name
  }

  const response = await s3.upload(uploadParams).promise();
  return {response: response.Key, status: true};
  
} catch (error) {
  console.log('hello');
  console.error(error);
  return {error: error, status: false};
}
}

// downloads a file from s3
const getFileStream = async (req, res) => {
  try {
    const downloadParams = {
      Key: req.body.key,
      Bucket: bucketName,
      Expires: 1200
      
    }
    // res.setHeader('Content-Type', 'image/jpg');
    // s3.getObject(downloadParams).createReadStream().on('error', error => {fs.createReadStream("broken.png").pipe(res);}).pipe(res);
      const url =  s3_2.getSignedUrlPromise('getObject', downloadParams).then((url) => {
      console.log(url);
      res.status(201).json({
        status: true,
        message: "success",
        errors: [],
        data: { url: url},
      });
    }, (err) => {
      res.status(201).json({
        status: false,
        message: "error fetching image",
        errors: [err],
        data: {},
      });
    });
    // console.log(url);
    
  } catch (error) {
    // console.log(error);
    // return fs.createReadStream("broken.png").pipe(res);
    res.status(201).json({
      status: false,
      message: "error fetching image",
      errors: [error],
      data: {},
    });
  }
  
}
const deleteChildren = async (dir) => {
  const listParams = {
      Bucket: bucketName,
      Prefix: dir
  };

  const listedObjects = await s3.listObjectsV2(listParams).promise();

  if (listedObjects.Contents.length === 0) return;

  const deleteParams = {
      Bucket: bucketName,
      Delete: { Objects: [] }
  };

  listedObjects.Contents.forEach(({ Key }) => {
      deleteParams.Delete.Objects.push({ Key });
  });

  await s3.deleteObjects(deleteParams).promise();

  if (listedObjects.IsTruncated) await deleteChildren(dir);
}

const deleteFile = async (key) => {
  try {
    // const deleteParams = {
    //   Key:key,
    //   Bucket: bucketName
    // };
    await deleteChildren(key);
    //  s3.deleteObject(deleteParams).promise();
    return {status: true};
  } catch (error) {
    return {error: error, status: false};
  }
}

  // generatePublicUrl();

module.exports = {
    // generatePublicUrl, createFolder, drivePostUpload, deleteFile, createRecipeFolder, driveRecipeUpload,
     uploadPost, uploadRecipe, getFileStream, deleteFile
};