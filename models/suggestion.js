// const { Timestamp } = require("mongodb")
const mongoose=require('mongoose')
// let exp = new Date.now();
let suggestionSchema=new mongoose.Schema({
    suggest:[{ 
        type: {
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
            recipeImageID:{
                type:String,
                
            },
            name:{
                type:String,
            },
        },
    }],
    expires: {type: Date},
},{timestamps:true});

// suggestionSchema.index({"createdAt": 1},{expireAfterSeconds: 60*45});
suggestionSchema.index({ expires: 1}, {expireAfterSeconds: 0 });

const Suggestion=mongoose.model('suggestion',suggestionSchema);

module.exports=Suggestion