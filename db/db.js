require('dotenv').config();
const mongoose=require('mongoose')
const db="mongodb+srv://rishabh:rishabh@cluster0.58od3.mongodb.net/Users?retryWrites=true&w=majority";
// const db=process.env.URI;

mongoose.connect(db,{
    useNewUrlParser:true,
    // useCreateIndex:true,
    useUnifiedTopology: true,
    // useFindAndModify:false 
}).then(()=>{
    console.log("Connection Successful");
}).catch((err)=>{
    console.log("No connection");
})