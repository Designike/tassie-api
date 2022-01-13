const jwt=require('jsonwebtoken')
const User=require('../models/users.js')

const auth=async(req,res,next)=>{
    try{
        const token=req.header('Authorization').replace('Bearer ','').trim()
        const decoded=jwt.verify(token,'tassie')
        const user=await User.findOne({_id:decoded._id,'tokens.token':token})

        if(!user){
            throw new Error()
        }

        req.token=token
        req.user=user
        next()
    }catch(error){
        console.log(error);
        res.status(401).send({error:'Please Authenticate'})
        
    }
}

module.exports=auth