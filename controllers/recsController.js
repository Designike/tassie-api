const Bookmark = require("../models/bookmarks.js");
const Tag = require("../models/tag.js");
// const Recs = require("../models/recipe.js");
// const Subscribed = require("../models/subscribed.js");
const { v4: uuidv4 } = require("uuid");
const Recipe = require("../models/recipe.js");
const { deleteFile, uploadRecipe } = require('./driveController');
const ingredients = require("../ingredients.json");

const loadRecs = (req, res) => {
    // console.log(res.paginatedResults);
    res.status(201).json({
        status: true,
        message: "",
        errors: [],
        data: res.paginatedResults,
      });
}

const createRecipe = async (req,res) => {
    try {
        
    const uuid = req.user.uuid + '_recipe_' + uuidv4();
    // const recipeFolder = await createRecipeFolder(uuid, req.user.recipeFolder);
    // console.log(recipeFolder);
    // if(recipeFolder.status == true) {
        const recs = new Recipe({uuid:uuid, username: req.user.username, userUuid: req.user.uuid, profilePic: req.user.profilePic});
        await recs.save(async (err,result)=>{
            if(err){
                // await deleteFile(recipeFolder.response.id);
                res.status(201).json({
                    status: false,
                    message: "Error creating : 1",
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
    // } else {
    //     res.status(201).json({
    //         status: false,
    //         message: "Error creating 2",
    //         errors: [],
    //         data: {},
    //     });
    // }
    
    } catch (error) {
        res.status(201).json({
            status: false,
            message: "Error creating : 2",
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

    // if(updates.folder != undefined) {
    //     delete updates.folder;
    // }
    if(updates.imgName != undefined) {
        delete updates.imgName;
    }
    if (req.file) {
        const imgName = req.body.imgName;
        // const folder = req.body.folder;
        // const uploadImg = await driveRecipeUpload(imgName, req.file, folder);

                const recs = await Recipe.findOne({uuid:req.body.uuid});
                updates.forEach((update) => (recs[update] = req.body[update]));
                const imgMap = imgName.split('_');

                const uploadImg = await uploadRecipe(req.user.uuid, req.file, recs.uuid, imgName);
                console.log(uploadImg);
                if(uploadImg.status == true) {
                    if(imgMap[0] == 'r') {
                        recs.recipeImageID = uploadImg.response;
                    } else if( imgMap[0] == 'i'){
                        recs.ingredientPics.push({
                            index: imgMap[1],
                            fileID: uploadImg.response
                        });   
                    } else {
                        recs.stepPics.push({
                            index: imgMap[1],
                            url: uploadImg.response
                        });
                    }
                    await recs.save(err => {
                        if(err) {
                            deleteFile(uploadImg.response);
                            throw err;
                        }
                    });
                    res.status(201).json({
                        status: true,
                        message: "Data saved",
                        errors:[],
                        data: {}
                    })
                } else {
                    // console.log(error);
                        res.status(201).json({
                            status: false,
                            message: "Unable to update last changes !",
                            errors:[],
                            data: {}
                        })
                }

            
            
        // } else {
        //     res.status(201).json({
        //         status: false,
        //         message: "Unable to update last changes !",
        //         errors:error,
        //         data: {}
        //     })
        // }
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
    console.error(error);
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
        const del = await deleteFile('recipes/' + req.user.uuid + '/' + uuid ); 
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


const addBookmark = async (req,res) => {
    // console.log('hello');
    try{
    const userUuid = req.user.uuid;
    const recUuid = req.body.uuid;
    // console.log(postUuid);
    let rec = await Recipe.findOne({uuid:recUuid});
    console.log(rec);
    if(!rec.bookmarks.includes(userUuid)){
        rec.bookmarks.push(userUuid);
    }
    let bookmark = await Bookmark.findOne({userUuid:userUuid});
    if(!bookmark.recipeUuid.includes(recUuid)){
        bookmark.recipeUuid.push(recUuid);
    }
    // console.log('hello');
    // console.log(post);
    await rec.save();
    await bookmark.save();
    console.log('saved');
    res.status(201).json({
        status: true,
        message: "Bookmarked",
        errors: [],
        data: {},
      });
    }catch(err){
        console.log(err);
        res.status(201).json({
            status: false,
            message: "error saving it",
            errors: [],
            data: {},
          });
    }

}

const removeBookmark = async (req,res) => {
    try{
        const userUuid = req.user.uuid;
        const recUuid = req.body.uuid;
        // console.log(postUuid);
        let rec = await Recipe.findOne({uuid:recUuid});
        let bookmark = await Bookmark.findOne({userUuid:userUuid});
        // console.log(post);
        // console.log('hello');
        // console.log(post);
        rec.bookmarks.pop(userUuid);
        bookmark.pop(recipeUuid);
        await rec.save();
        await bookmark.save();
        console.log('saved');
        res.status(201).json({
            status: true,
            message: "Bookmarked",
            errors: [],
            data: {},
          });
        }catch(err){
            console.log(err);
            res.status(201).json({
                status: false,
                message: "error saving it",
                errors: [],
                data: {},
              });
        }
// }post.bookmarks.pop(userUuid);
}
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
const addHashtag = async (req,res) => {
    let hashtagString = req.body.desc;
    let hashtag = hashtagString.match(/#\w+/g);
    if(hashtag != null){ 
        hashtag = hashtag.filter(onlyUnique);
    
    let recipeUuid = req.body.uuid;
    let index = 0;
    hashtag.forEach(async tag => {
        let tag1 = await Tag.findOne({name: tag});
        if (tag1) {
            tag1.recipe.push(recipeUuid);
            await tag1.save();
        }else{
            let tag2 = new Tag({name: tag, recipe: [recipeUuid], post: []});
            await tag2.save();
        }
        index++;
        // if(index == hashtag.length - 1){
        //     res.status(201).json({
        //         status: true,
        //         message: "tagged",
        //         errors: [],
        //         data: {},
        //       });
        // }
    });
}
    const rec = await Recipe.findOne({uuid:req.body.uuid});
    // console.log('2a');
    rec.desc = req.body.desc;
    rec.save((err)=>{
        if(!err){
            res.status(201).json({
                status: true,
                message: "Saved successfully",
                errors: [],
                data: {},
            });
        }
        else{
            console.log(err);
            res.status(201).json({
                status: false,
                message: "Error while saving",
                errors: [err],
                data: {},
            });
        }
    });

}

const getHashtag = async (req,res) => {
    let tag = req.body.tag;
    let suggestion = await Tag.find({name: {$regex: '^' + tag}},'-_id name');
    console.log(suggestion);
    res.status(201).json({
        status: true,
        message: "sugesstions",
        errors: [],
        data: suggestion,
      });
}

module.exports = {
    loadRecs,
    createRecipe,
    deleteRecipe,
    updateRecipe,
    getIng,
    resetImage,
    addBookmark,
    removeBookmark,
    addHashtag,
    getHashtag
};