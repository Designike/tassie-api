require('dotenv').config();
const mongoose=require('mongoose')
const fs = require('fs');

const User = require('../models/users');

const db="mongodb+srv://designike:"+ process.env.MONGO_PASS +"@designike.czxau.mongodb.net/"+ process.env.MONGO_DB +"?retryWrites=true&w=majority";
// const db=process.env.URI;

mongoose.connect(db,{
    useNewUrlParser:true,
    // useCreateIndex:true,
    useUnifiedTopology: true,
    // useFindAndModify:false 
}).then(() => {
    fs.rmSync("./uploads", { recursive: true, force: true });
}).then(()=>{
    User.find({},(err,found) => {
        found.forEach(element => {
            const create_folder = `${"./uploads/" + element.uuid}`;
            fs.mkdir(create_folder, {recursive: true}, function(err) {
                if(err) throw err;
            });
        });
    });
}).then(() => {
    console.log("Connection Successful");
}).catch((err)=>{
    console.log("No connection");
})

// const conn = mongoose.connection();

// module.exports = conn;
