require('dotenv').config();

const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

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

async function uploadFile(){
    try{
        const response = await drive.files.create({
            requestBody:{
                name:'logo.png',
                mimeType: 'image/png'
            },
            media:{
                mimeType:'image/png',
                body:fs.createReadStream(filePath),
            },
        })
    }catch(err){
        console.log(err);
    }
}

uploadFile();