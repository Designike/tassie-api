const mongoose=require('mongoose')

const subscribedSchema = new mongoose.Schema({
    user:{
        type:String,
        required:true,
    },
    subscribed:{
        type:[String],
        required:true
    },
    subscriber:{
        type:[String],
        required:true
    }
});

const Subscribed=mongoose.model('subscribed',subscribedSchema)
module.exports=Subscribed