// const { Timestamp } = require("mongodb")
const mongoose=require('mongoose')

const recipeSchema=new mongoose.Schema({
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
    recipeImageID:{
        type:String,
    },
    youtubeLink:{
        type:String,
    },
    likes:{
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
            comment:{
                type:String,
                
            },
        }],
        
    },
    name:{
        type:String,
        
    },
    ingredients:[String],
    ingredientPics:[{
        index:String,
        url:String,
        fileID: String
    }],
    steps:[String],
    stepPics:[{
        index:String,
        url:String,
        fileID:String,
    }],
    recipeFolder:{
        type:String,
        required:true
     },
    veg:{
        type:Boolean
    },
    flavour:{
        type:String
    },
    course:{
        type:String
    },
    estimatedTime:{
        type:Number
    },
    isPost:{
        type:Boolean,
        default: false
    },
    bookmarks:{
        type:[String]
    },
}, {timestamps: true});

const Recipe=mongoose.model('recipe',recipeSchema)
module.exports=Recipe