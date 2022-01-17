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

const driveUpload = async (uuid, file) => {
  const name = uuid+'_post_' + uuidv4();
  await drive.files.create({
    media:{
        mimeType: file.mimeType,
        body: fs.createReadStream(file.path),
    }, 
    requestBody: {
      name: name + path.extname(file.originalname),
      mimeType: file.mimeType,
    },
    
  }).then(response => {
    return {response: response.data, status: true, filename: name};
  }).catch(err => {
    return {error: err, status: false}
  })

}

const createFolder = async (folderName, isPost) => {
  let parent = isPost ? process.env.POST_FOLDER : process.env.RECIPE_FOLDER;
  var fileMetadata = {
    'name': folderName,
    'mimeType': 'application/vnd.google-apps.folder',
    parents: [parent]
  };
  await drive.files.create({
    resource: fileMetadata,
    fields: 'id'
  }).then(response => {
    return {response: response.data, status: true};
  }).catch(err => {
    return {error: err, status: false}
  })
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
      await drive.files.delete({
        fileId: fileId,
      }).then(response => {
        return {response: response.data, status: true};
      }).catch(err => {
        return {error: err, status: false}
      })
}

  // deleteFile();
  
  const generatePublicUrl = async (fileId) => {
    
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      }).then( async () => {
        await drive.files.get({
          fileId: fileId,
          fields: 'webContentLink',
        }).then(response => {
          return {response: response.data, status: true};
        }).catch(err => {
          return {error: err, status: false}
        })
      })    

  }
  
  // generatePublicUrl();

module.exports = {
    generatePublicUrl, createFolder, driveUpload
};