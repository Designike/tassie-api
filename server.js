const express=require('express')
const mongoose=require('./db/db.js')
const userRouter=require('./routes/userRouter')
const feedRouter=require('./routes/feedRouter')
const recipeRouter=require('./routes/recsRouter')
const driveRouter=require('./routes/driveRouter')
const searchRouter=require('./routes/searchRouter')
const profileRouter=require('./routes/profileRouter')

const app=express()
const port=process.env.PORT||3000

app.use(express.json())
app.use('/user', userRouter)
app.use('/feed', feedRouter)
app.use('/recs', recipeRouter)
app.use('/drive', driveRouter)
app.use('/search',searchRouter)
app.use('/profile',profileRouter)

app.listen(port,()=>{
    console.log('Server is up on the port '+port+" !")
})