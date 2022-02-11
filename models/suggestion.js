// const { Timestamp } = require("mongodb")
const mongoose=require('mongoose')

let suggestionSchema=new mongoose.Schema({
    suggest:{ 
        type: [{
            uuid:{
                type:String,
            },
            username:{
                type:String,
                trim:true,
            },
            profilePic:{
                type:String,
                
            },
            userUuid:{
                type:String,
            },
            // url:{
            //     type:String,
                
            // },
            name:{
                type:String,
            },
        }],
    },
},{timestamps:true});

suggestionSchema.index({"createdAt": 1},{expireAfterSeconds: 60*45});

const Suggestion=mongoose.model('suggestion',suggestionSchema);

module.exports=Suggestion