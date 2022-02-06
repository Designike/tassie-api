const mongoose=require('mongoose')

const bookmarkSchema = new mongoose.Schema({
    userUuid:String,
    recipeUuid:[String],
    postUuid:[String],
});

const Bookmark=mongoose.model('bookmark',bookmarkSchema)
module.exports=Bookmark