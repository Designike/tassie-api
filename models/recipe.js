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
        url:String
    }],
    steps:[String],
    stepPics:[{
        index:String,
        url:String
    }],
    recipeFolder:{
        type:String,
        required:true
     },
}, {timestamps: true});

const Recipe=mongoose.model('recipe',recipeSchema)
module.exports=Recipe