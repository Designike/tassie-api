const express=require('express')
const mongoose=require('./db/db.js')
const userRouter=require('./routes/userRouter')
const feedRouter=require('./routes/feedRouter')
const recipeRouter=require('./routes/recsRouter')

const app=express()
const port=process.env.PORT||3000

app.use(express.json())
app.use('/user', userRouter) 
app.use('/feed', feedRouter) 
app.use('/recs', recipeRouter) 

app.listen(port,()=>{
    console.log('Server is up on the port '+port+" !")
})