// const { Timestamp } = require("mongodb")
const mongoose=require('mongoose')

const postSchema=new mongoose.Schema({
    uuid:{
        type:String,
        
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
    description:{
       type:String,
       
       trim:true
    },
    // url:{
    //     type:String,
    //     
    // },
    postID: {
        type: String,
        // required: true
    },
    likes:{
        type:[String],
        
    },
    bookmarks:{
        type:[String],
        
    },
    comments:{
        type:[{
            uuid:{
                type:String,
                
            },
            username:{
                type:String,
                
            },
            profilePic:{
                type:String,
            },
            comment:{
                type:String,
                
            },
        }],
        
    },
    isPost:{
        type:Boolean,
        default: true
    }
}, {timestamps: true});

const Post=mongoose.model('post',postSchema)
module.exports=Post