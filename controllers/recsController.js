const User = require("../models/users.js");
const Recs = require("../models/recipe.js");
const Subscribed = require("../models/subscribed.js");
const { v4: uuidv4 } = require("uuid");
const Recipe = require("../models/recipe.js");


const loadRecs = (req, res) => {
    res.status(201).json({
        status: true,
        message: "",
        errors: [],
        data: {recs: res.paginatedResults},
      });
}

const createRecipe = async (req,res) => {
    const uuid = req.user.uuid + '_recipe_' + uuidv4();
    const recs = new Recipe({uuid:uuid});
    await recs.save((err,result)=>{
        if(err){
            res.status(201).json({
                status: false,
                message: "Error creating",
                errors: [],
                data: {},
              });
        }else{
            res.status(201).json({
                status: true,
                message: "created",
                errors: [],
                data: {recUuid:uuid},
              });
        }
    });
}

module.exports = {
    loadRecs,
    createRecipe,
};