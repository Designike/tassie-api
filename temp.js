// require('dotenv').config();
// const Post = require("./models/post.js");
// const { google } = require('googleapis');
// const path = require('path');
// const fs = require('fs');
// const stream = require('stream');
// const { v4: uuidv4 } = require("uuid");
const mongoose=require('./db/db.js')

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


// const createFolder = async () => {
//     var fileMetadata = {
//       'name': 'parth',
//       'mimeType': 'application/vnd.google-apps.folder',
//       parents: [['1Ou0zXM6cUjVOiCLO1u5GQWXLE9ETDpvb','1K9lBqOZaMLWlt5lKRN80fvXyM6okGOvP']]
//     };
//     drive.files.create({
//       resource: fileMetadata,
//       fields: 'id'
//     }, function (err, file) {
//       if (err) {
//         // Handle error
//         console.error(err);
//       } else {
//         console.log('Folder Id: ', file.data.id);
//       }
//     });
//   }
  
//   async function generatePublicUrl(fileId) {
//     try {
//       await drive.permissions.create({
//         fileId: fileId,
//         requestBody: {
//           role: 'reader',
//           type: 'anyone',
//         },
//       });
  
//       /* 
//       webViewLink: View the file in browser
//       webContentLink: Direct download link 
//       */
//       const result = await drive.files.get({
//         fileId: fileId,
//         fields: 'webContentLink',
//       });
//       console.log(result.data);
//     } catch (error) {
//       console.log(error.message);
//     }
//   }
  
  // generatePublicUrl('1Cxx3tAqOLKPNYigdrc3WKM6QoNW9KGmi');


  // '
//   '1hfwjdy0Ap9KD2hr9cLjkxD0Wrw3NVhXi'
// createFolder()
// const check = async () => {
//   // let x = await Post.aggregate([{$match: {userUuid:'5f9ca685-d00a-43b5-b7e7-0cab79f86fe3_Sommy21'}},{$project: { metadata: [{count: { $size:"$comments" }}]},data: [{ $limit:1 },{ $skip:2 }]}]).exec()

// let x = await Post.aggregate([{ '$match' : {userUuid:'5f9ca685-d00a-43b5-b7e7-0cab79f86fe3_Sommy21'}},{ '$facet' : { metadata: [{count: { $size:"$comments" }}]},data: [{ $limit:1 },{ $skip:2}]}]).exec()
// console.log(x);        // console.log(x);
// }

// check();

const mongo = require('mongoose')



const personSchema = new mongo.Schema({
  uuid:String,
  name:String,
  profilePic:String
})
const foodSchema = new mongo.Schema({
  uuid:String,
  name:String,
  person:personSchema
})

const Person=mongo.model('person',personSchema)
const Food=mongo.model('food', foodSchema)

const newPerson = new Person({
  uuid:'asdfghjklzxcvbnmqwertyuiop',
  name:'john doe',
  profilePic:'hfsdhkjfshfs'
})

const henlo  = async () => {
  const person = await newPerson.save();
    // async (err, person) => {
  const recipeOne =  new Food({
    uuid:'csdcksdhjkhkdhkdkshf',
    name:'gol gappe',
    person: person._id
  })
  await recipeOne.save()


;}

// henlo();

const henlo2 = async () => {
  const find = await Food.findOne({uuid: 'csdcksdhjkhkdhkdkshf'})

console.log(find.person);
}

henlo2();