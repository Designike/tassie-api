const mongoose=require('mongoose')

const tagSchema = new mongoose.Schema({
    name:String,
    recipe:[String],
    post:[String],
    user:[{
        uuid:String,
        username:String,
        profilePic:String
    }],
    isUser:Boolean
    },);

const Tag=mongoose.model('tag',tagSchema)
module.exports=Tag