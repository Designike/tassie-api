const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const TassieCustomError = require('../errors/tassieCustomError')

const userSchema=new mongoose.Schema({
    uuid:{
        type:String,
        required:true,
        unique:true
    },
    name:{
       type:String,
       required:true,
       trim:true
    },
    // profilePic:{
    //     type:String,
    // },
    gender:{
        type:String,
        trim:true,
        validate(value){
            const gender = ['male','female','other', '']
            if(!(gender.includes(value))){
                throw new TassieCustomError('Enter a valid gender')
                
            }
        }
     },
    username:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        minLength:4,
        validate(value){
            // if(!validator.isAlphanumeric(value) && !value.includes("-") && !value.includes(".")){
                
            // }
            if(!(/^[0-9a-zA-Z.-]{4,}$/).test(value)) {
                throw new TassieCustomError('Username should have minimum 4 characters. It should only include numbers, letters, "." and "-"');
            }
        }
    },
    email:{
       type:String,
       unique:true,
       required:true,
       trim:true,
       lowercase:true,
       validate(value){
           if(!validator.isEmail(value)){
               throw new TassieCustomError('Enter a valid email address')
           }

       }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minLength:6,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new TassieCustomError('Password cannot contain password')
            }
        }
    },
    profilePic:{
        type:String,
    },
    isAuth:{
        type:Boolean,
    },
    number:{
        type:String,
    },
    website:{
        type:String,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isURL(value) && value != ""){
                throw new TassieCustomError('Enter a valid website')
            }
        }
     },
     bio:{
        type:String,
        trim:true
     },
    //  postFolder:{
    //     type:String,
    //     required:true
    //  },
    //  recipeFolder:{
    //     type:String,
    //     required:true
    //  },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})

userSchema.methods.generateAuthToken=async function(){
    const user=this
    const token=jwt.sign({_id:user._id.toString()},'tassie')
    
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials=async(email,username,password)=>{
    let user;
    if(email.length>0){
    user=await User.findOne({email:email, isAuth: false});
}else if(username.length>0){
    user=await User.findOne({username:username, isAuth: false});
}
    if(user == undefined){
        throw new TassieCustomError('Invalid Email or Username!')
        // throw new Error('Invalid Email or Username!')
    }
    const isMatch= await bcrypt.compare(password,user.password)

    if(!isMatch){
        // throw new Error('Invalid Password!')
        throw new TassieCustomError('Invalid Password!')
    }
    return user
}

//Hashing the plain text before saving
userSchema.pre('save',async function(next){
    const user=this

    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8)

    }
    // console.log('just before saving')

    next()
})

const User=mongoose.model('User',userSchema)
module.exports=User