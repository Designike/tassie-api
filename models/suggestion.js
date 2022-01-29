// const { Timestamp } = require("mongodb")
const mongoose=require('mongoose')

const suggestionSchema=new mongoose.Schema({suggest:[{
    uuid:{
        type:String,
        required:true,
        unique:true
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
    url:{
        type:String,
        
    },
    name:{
        type:String,
        
    },
}]}, {timestamps: true});

const Suggestion=mongoose.model('suggestion',suggestionSchema.index({}, {expires: 60}));
module.exports=Suggestion