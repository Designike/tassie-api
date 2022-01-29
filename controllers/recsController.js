// const User = require("../models/users.js");
// const Recs = require("../models/recipe.js");
// const Subscribed = require("../models/subscribed.js");
const { v4: uuidv4 } = require("uuid");
const Recipe = require("../models/recipe.js");
const { driveRecipeUpload, deleteFile, createRecipeFolder, generatePublicUrl } = require('./driveController');
const ingredients = require("../ingredients.json");

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
    console.log(recipeFolder);
    if(recipeFolder.status == true) {
        const recs = new Recipe({uuid:uuid, recipeFolder: recipeFolder.response.id, username: req.user.username, userUuid: req.user.uuid, profilePic: req.user.profilePic});
        await recs.save(async (err,result)=>{
            if(err){
                await deleteFile(recipeFolder.response.id);
                res.status(201).json({
                    status: false,
                    message: "Error creating 1",
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
            message: "Error creating 2",
            errors: [],
            data: {},
        });
    }
    
    } catch (error) {
        res.status(201).json({
            status: false,
            message: "Error creating 3",
            errors: [],
            data: {},
        });
    }
}

const updateRecipe = async (req,res) => {
    // console.log(req.body);
    // console.log(flavour);
    // console.log(ingredients);
    // console.log(course);
    // console.log(time);
  try {
    let updates = Object.keys(req.body);

    if(updates.folder != undefined) {
        delete updates.folder;
    }
    if(updates.imgName != undefined) {
        delete updates.imgName;
    }
    if (req.file) {
        const imgName = req.body.imgName;
        const folder = req.body.folder;
        const uploadImg = await driveRecipeUpload(imgName, req.file, folder);

        if(uploadImg.status == true) {
            const imgURL = await generatePublicUrl(uploadImg.response.id);
            
            if(imgURL.status == true) {
                const recs = await Recipe.findOne({uuid:req.body.uuid});
                updates.forEach((update) => (recs[update] = req.body[update]));
                const imgMap = imgName.split('_');
                
                if(imgMap[0] == 'r') {
                    recs.url = imgURL.response.webContentLink;
                    recs.recipeImageID = uploadImg.response.id;
                } else if( imgMap[0] == 'i'){
                    recs.ingredientPics.push({
                        index: imgMap[1],
                        url: imgURL.response.webContentLink,
                        fileID: uploadImg.response.id
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
        res.status(201).json({
            status: true,
            message: "Data saved",
            errors:[],
            data: {}
        })
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

const resetImage = async (req,res) => {
    try {
        const uuid = req.body.uuid;
        console.log(uuid);
        const imgName = req.body.imgName;        
        var temp = imgName.split('_');
        var index = temp[1];
        var key = temp[0];
        var recipe = await Recipe.findOne({uuid: uuid});
        console.log(recipe);
        let fileID;
        if(key == 'r'){
            fileID = recipe.recipeImageID;
        }else if(key == 'i'){
            fileID = recipe.ingredientPics.filter((a) => {return a.index == index})[0].fileID;
        }else{
            fileID = recipe.stepPics.filter((a) => {return a.index == index})[0].fileID;
        }
        console.log('1');
        const del = await deleteFile(fileID); 
        if(del.status == true) { 
            var recipe = await Recipe.findOne({uuid: uuid});
            if(key == 'r'){
                recipe.url = "";
                recipe.recipeImageID = "";
            }else if(key == 'i'){
                recipe.ingredientPics = recipe.ingredientPics.filter((a) => {return a.index != index});
            }else{
                recipe.stepPics = recipe.stepPics.filter((a) => {return a.index != index});
            }
        console.log('1');
        await recipe.save();
        console.log('1');
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

const getIng = (req,res) => {
    try {
        res.status(201).json({
            status: true,
            message: "deleted",
            errors: [],
            data: {"ingredients": ingredients},
        });
    } catch (error) {
        res.status(201).json({
            status: false,
            message: "unable to fetch data",
            errors: [],
            data: {},
        });
    }
}

module.exports = {
    loadRecs,
    createRecipe,
    deleteRecipe,
    updateRecipe,
    getIng,
    resetImage
};