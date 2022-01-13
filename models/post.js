const { Timestamp } = require("mongodb")

const postSchema=new mongoose.Schema({
    uuid:{
        type:String,
        required:true,
        unique:true
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
    time:{
        type:Timestamp,
        required:true
    },
    likes:{
        type:[String],
        required:true
    },
    comments:{
        type:[{
            uuid:{
                type:String,
                required:true,
            },
            comment:{
                type:String,
                required:true,
            },
        }],
        required:true
    }
})

const Post=mongoose.model('post',postSchema)
module.exports=Post