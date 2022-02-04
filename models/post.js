// const { Timestamp } = require("mongodb")
const mongoose=require('mongoose')

const postSchema=new mongoose.Schema({
    uuid:{
        type:String,
        required:true,
        unique:true
    },
    username:{
        type:String,
        required:true,
        trim:true,
    },
    profilePic:{
        type:String,
        required:true
    },
    userUuid:{
        type:String,
        required:true,
    },
    description:{
       type:String,
       required:true,
       trim:true
    },
    url:{
        type:String,
        required:true
    },
    postID: {
        type: String,
        // required: true
    },
    likes:{
        type:[String],
        required:true
    },
    bookmarks:{
        type:[String],
        required:true
    },
    comments:{
        type:[{
            uuid:{
                type:String,
                required:true,
            },
            username:{
                type:String,
                required:true,
            },
            comment:{
                type:String,
                required:true,
            },
        }],
        required:true
    },
    isPost:{
        type:Boolean,
        default: true
    }
}, {timestamps: true});

const Post=mongoose.model('post',postSchema)
module.exports=Post