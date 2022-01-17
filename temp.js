require('dotenv').config();

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const stream = require('stream');
const { v4: uuidv4 } = require("uuid");

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


const createFolder = async () => {
    var fileMetadata = {
      'name': 'parth',
      'mimeType': 'application/vnd.google-apps.folder',
      parents: [['1Ou0zXM6cUjVOiCLO1u5GQWXLE9ETDpvb','1K9lBqOZaMLWlt5lKRN80fvXyM6okGOvP']]
    };
    drive.files.create({
      resource: fileMetadata,
      fields: 'id'
    }, function (err, file) {
      if (err) {
        // Handle error
        console.error(err);
      } else {
        console.log('Folder Id: ', file.data.id);
      }
    });
  }
  
  async function generatePublicUrl(fileId) {
    try {
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
        fields: 'webContentLink',
      });
      console.log(result.data);
    } catch (error) {
      console.log(error.message);
    }
  }
  
  generatePublicUrl('1Cxx3tAqOLKPNYigdrc3WKM6QoNW9KGmi');


  // '
//   '1hfwjdy0Ap9KD2hr9cLjkxD0Wrw3NVhXi'
// createFolder()