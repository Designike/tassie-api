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

const updateRecipe = async (req,res) => {
    const updates = Object.keys(req.body);
  try {
    const recs = await Recipe.findOne({uuid:req.body.uuid});

    updates.forEach((update) => (recs[update] = req.body[update]));

    await recs.save();

    // res.status(200).send(user);
    res.status(201).json({
        status: true,
        message: "Your recipe is saved",
        errors:[],
        data: {}
    })
  } catch (error) {
    // res.status(500).send(error);
    res.status(201).json({
        status: false,
        message: "Unable to update your recipe !!!",
        errors:error,
        data: {}
    })
  }
}

const deleteRecipe = async (req,res) => {
    try {
        const uuid = req.body.uuid
        await Recipe.findOneAndDelete({uuid: uuid});
        res.status(201).json({
            status: true,
            message: "deleted",
            errors: [],
            data: {},
        });
    } catch (error) {
        res.status(201).json({
            status: false,
            message: "Error deleting",
            errors: [],
            data: {},
        });
    }
}

module.exports = {
    loadRecs,
    createRecipe,
    deleteRecipe,
    updateRecipe
};