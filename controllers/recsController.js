const User = require("../models/users.js");
const Recs = require("../models/recipe.js");
const Subscribed = require("../models/subscribed.js");
const { v4: uuidv4 } = require("uuid");
const Recipe = require("../models/recipe.js");
const { driveRecipeUpload, deleteFile, createRecipeFolder, generatePublicUrl } = require('./driveController');


const loadRecs = (req, res) => {
    res.status(201).json({
        status: true,
        message: "",
        errors: [],
        data: {recs: res.paginatedResults},
      });
}

const createRecipe = async (req,res) => {
    try {
        
    const uuid = req.user.uuid + '_recipe_' + uuidv4();
    const recipeFolder = await createRecipeFolder(uuid, req.user.recipeFolder);
    if(recipeFolder.status == true) {
        const recs = new Recipe({uuid:uuid, recipeFolder: recipeFolder.response.id});
        await recs.save(async (err,result)=>{
            if(err){
                await deleteFile(recipeFolder.response.id);
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
                    data: {recUuid:uuid, folder: recipeFolder.response.id},
                });
            }
        });
    } else {
        res.status(201).json({
            status: false,
            message: "Error creating",
            errors: [],
            data: {},
        });
    }
    
    } catch (error) {
        res.status(201).json({
            status: false,
            message: "Error creating",
            errors: [],
            data: {},
        });
    }
}

const updateRecipe = async (req,res) => {
    let updates = Object.keys(req.body);
    const imgName = req.body.imgName;
    const folder = req.body.folder;

    if(updates.folder != undefined) {
        delete updates.folder;
    }
    if(updates.imgName != undefined) {
        delete updates.imgName;
    }

  try {
    if (req.file) {
        const uploadImg = await driveRecipeUpload(imgName, req.file, folder);

        if(uploadImg.status == true) {
            const imgURL = await generatePublicUrl(uploadImg.response.id);
            
            if(imgURL.status == true) {
                const recs = await Recipe.findOne({uuid:req.body.uuid});
                updates.forEach((update) => (recs[update] = req.body[update]));
                const imgMap = imgName.split('_');
                
                if(imgMap[0] == 'r') {
                    recs.url = imgURL.response.webContentLink;
                } else if( imgMap[0] == 'i'){
                    recs.ingredientPics.push({
                        index: imgMap[1],
                        url: imgURL.response.webContentLink
                    });   
                } else {
                    recs.stepPics.push({
                        index: imgMap[1],
                        url: imgURL.response.webContentLink
                    });
                }
                await recs.save();
                
                // res.status(200).send(user);
                res.status(201).json({
                    status: true,
                    message: "Data saved",
                    errors:[],
                    data: {}
                })
            } else {
                res.status(201).json({
                    status: false,
                    message: "Unable to update last changes !",
                    errors:error,
                    data: {}
                })
            }
            
        } else {
            res.status(201).json({
                status: false,
                message: "Unable to update last changes !",
                errors:error,
                data: {}
            })
        }
    } else {
        const recs = await Recipe.findOne({uuid:req.body.uuid});
        updates.forEach((update) => (recs[update] = req.body[update]));
        await recs.save();
    }
    
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
        const del = await deleteFile(req.body.folder); 
        if(del.status == true) { 
        res.status(201).json({
            status: true,
            message: "deleted",
            errors: [],
            data: {},
        });
    } else {
        res.status(201).json({
            status: false,
            message: "Error deleting",
            errors: [],
            data: {},
        });
    }
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