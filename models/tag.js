const mongoose=require('mongoose')

const tagSchema = new mongoose.Schema({
    name:String,
    recipe:[String],
    post:[String],
    },
);

const Tag=mongoose.model('tag',tagSchema)
module.exports=Tag