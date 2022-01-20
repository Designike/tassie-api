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
    ingredients:{
        type:[{
            url:{
                type:String,
                
            },
            name:{
                type:String,
                
            }
        }]
    },
    steps:{
        type:[{
            url:{
                type:String,
                
            },
            name:{
                type:String,
                
            }
        }]
    },
    recipeFolder:{
        type:String,
        required:true
     },
}, {timestamps: true});

const Recipe=mongoose.model('recipe',recipeSchema)
module.exports=Recipe