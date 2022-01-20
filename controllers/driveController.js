require('dotenv').config();

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const stream = require('stream');
const { v4: uuidv4 } = require("uuid");
const { response } = require('express');

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

oauth2Client.setCredentials({refresh_token:process.env.REFRESH_TOKEN});

const drive = google.drive({
    version:'v3',
    auth:oauth2Client
});


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

const drivePostUpload = async (uuid, file, folder) => {
  try {
    const name = uuid+'_post_' + uuidv4();
    var fileMetadata = {
      'name': name + path.extname(file.originalname),
      parents: [folder]
    };
    const response = await drive.files.create({
      media:{
          mimeType: file.mimeType,
          body: fs.createReadStream(file.path),
      }, 
      resource : fileMetadata
    })
    return {response: response.data, status: true, filename: name};
  } catch (error) {
    return {error: error, status: false};
  }

}

const driveRecipeUpload = async (suffixName, file, folder) => {
  try {
    // const name = uuid + suffixName;
    var fileMetadata = {
      'name': suffixName + path.extname(file.originalname),
      parents: [folder]
    };
    const response = await drive.files.create({
      media:{
          mimeType: file.mimeType,
          body: fs.createReadStream(file.path),
      }, 
      resource : fileMetadata
    })
    return {response: response.data, status: true};
  } catch (error) {
    return {error: error, status: false};
  }

}

const createFolder = async (folderName, isPost) => {
  try {
    let parent = isPost ? process.env.POST_FOLDER : process.env.RECIPE_FOLDER;
    var fileMetadata = {
      'name': folderName,
      'mimeType': 'application/vnd.google-apps.folder',
      parents: [parent]
    };
    const response = await drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    })
    return {response: response.data, status: true};
  } catch (error) {
    return {error: error, status: false};
  }
 
}


const createRecipeFolder = async (folderName, parent) => {
  try {
    var fileMetadata = {
      'name': folderName,
      'mimeType': 'application/vnd.google-apps.folder',
      parents: [parent]
    };
    const response = await drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    })
    return {response: response.data, status: true};
  } catch (error) {
    return {error: error, status: false};
  }
 
}
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
const deleteFile = async (fileId) => {
  try {
    const response = await drive.files.delete({
      fileId: fileId,
    })
    return {response: response.data, status: true};
  } catch (error) {
    return {error: error, status: false}
  }
}

  // deleteFile();
  
const generatePublicUrl = async (fileId) => {
  try {
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    })
    const response = await drive.files.get({
      fileId: fileId,
      fields: 'webContentLink',
    })
    return {response: response.data, status: true};
  } catch (error) {
    return {error: err, status: false}
  }   

}
  
  // generatePublicUrl();

module.exports = {
    generatePublicUrl, createFolder, drivePostUpload, deleteFile, createRecipeFolder, driveRecipeUpload
};