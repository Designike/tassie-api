require('dotenv').config();

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const stream = require('stream');

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

const uploadFil = (req,res) => {
    console.log(req.body);
    console.log(req.image);
    console.log(req.body.image);
    console.log(req.file);
    // upload(req,res,req.file);
    res.status(201).json({
      status: true,
      message: "done",
      errors: [],
      data: {},
    });
    
}

const uploadFile = async (req,res) => {
    try{
        let file = req.file;
        console.log(file.path.split(/\\(.+)/)[2]);
        const response = await drive.files.create({
            media:{
                mimeType: file.mimeType,
                body: fs.createReadStream(file.path),
            },
            resource: {
              name: file.path.split(/\\(.+)/,3)[2],
            }
        })
        if(response.status == 200){
        res.status(201).json({
            status: true,
            message: "done",
            errors: [],
            data: {},
          });
        }
        else{
            res.status(201).json({
                status: false,
                message: "error 1",
                errors: [],
                data: {},
              });
        }
    }catch(err){
        console.log(err);
        res.status(201).json({
            status: false,
            message: "error 2",
            errors: [],
            data: {},
          });
    }
}

// uploadFile();
async function deleteFile() {
    try {
      const response = await drive.files.delete({
        fileId: 'YOUR FILE ID',
      });
      console.log(response.data, response.status);
    } catch (error) {
      console.log(error.message);
    }
  }
  
  // deleteFile();
  
  async function generatePublicUrl() {
    try {
      const fileId = 'YOUR FILE ID';
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
  
      /* 
      webViewLink: View the file in browser
      webContentLink: Direct download link 
      */
      const result = await drive.files.get({
        fileId: fileId,
        fields: 'webViewLink, webContentLink',
      });
      console.log(result.data);
    } catch (error) {
      console.log(error.message);
    }
  }
  
  // generatePublicUrl();

module.exports = {
    uploadFile,
};