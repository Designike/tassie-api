const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')

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
    profilePic:{
        type:String,
    },
    gender:{
        type:String,
        trim:true,
        validate(value){
            gender = ['Male','Female','Other']
            if(!(value in gender)){
                throw new Error('Enter a valid gender')
            }
        }
     },
    username:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        minLength:6,
        validate(value){
            if(!validator.isAlphanumeric(value)){
                throw new Error('Enter a valid username')
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
               throw new Error('Enter a valid email address')
           }

       }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minLength:7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password cannot contain password')
            }
        }
    },
    profilePic:{
        type:String,
        required:true
    },
    website:{
        type:String,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isURL(value)){
                throw new Error('Enter a valid website')
            }
        }
     },
     bio:{
        type:String,
        trim:true
     },
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
    user=await User.findOne({email:email});
}else if(username.length>0){
    user=await User.findOne({username:username});
}
    if(user == undefined){
        throw new Error('Invalid Email or Username!')
    }
    const isMatch= await bcrypt.compare(password,user.password)

    if(!isMatch){
        throw new Error('Invalid Password!')
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