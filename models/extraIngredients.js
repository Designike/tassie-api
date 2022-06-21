const mongoose=require('mongoose')

const extraIngSchema = new mongoose.Schema({
    ingredients:[String],
});

const ExtraIngredients=mongoose.model('extraIngredient',extraIngSchema)
module.exports=ExtraIngredients