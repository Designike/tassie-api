const Bookmark = require("../models/bookmarks.js");
const Tag = require("../models/tag.js");
// const Recs = require("../models/recipe.js");
const Subscribed = require("../models/subscribed.js");
const { v4: uuidv4 } = require("uuid");
const Recipe = require("../models/recipe.js");
const { deleteFile, uploadRecipe, renameFile } = require("./driveController");
const ingredients = require("../ingredients.json");

const loadRecs = (req, res) => {
  // console.log(res.paginatedResults);
  res.status(201).json({
    status: true,
    message: "",
    errors: [],
    data: res.paginatedResults,
  });
};

const createRecipe = async (req, res) => {
  try {
    const uuid = req.user.uuid + "_recipe_" + uuidv4();
    // const recipeFolder = await createRecipeFolder(uuid, req.user.recipeFolder);
    // console.log(recipeFolder);
    // if(recipeFolder.status == true) {
    const recs = new Recipe({
      uuid: uuid,
      username: req.user.username,
      userUuid: req.user.uuid,
      profilePic: req.user.profilePic,
      recipeImageID: "",
      youtubeLink: "",
      likes: [],
      comments: [],
      name: "",
      ingredients: [],
      ingredientPics: [],
      steps: [],
      stepPics: [],
      veg: true,
      flavour: "",
      course: "",
      estimatedTime: 0,
      bookmarks: [],
      desc: "",
      isBreakfast: false,
      isLunch: false,
      isDinner: false,
      isCraving: false,
      ratings: [],
    });
    await recs.save(async (err, result) => {
      if (err) {
        // await deleteFile(recipeFolder.response.id);
        res.status(201).json({
          status: false,
          message: "Error creating : 1",
          errors: [],
          data: {},
        });
      } else {
        res.status(201).json({
          status: true,
          message: "created",
          errors: [],
          data: { recUuid: uuid },
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
};

const updateRecipe = async (req, res) => {
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
    if (updates.imgName != undefined) {
      delete updates.imgName;
    }
    if (req.file) {
      const imgName = req.body.imgName;
      // const folder = req.body.folder;
      // const uploadImg = await driveRecipeUpload(imgName, req.file, folder);

      const recs = await Recipe.findOne({ uuid: req.body.uuid });
      updates.forEach((update) => (recs[update] = req.body[update]));
      const imgMap = imgName.split("_");

      const uploadImg = await uploadRecipe(
        req.user.uuid,
        req.file,
        recs.uuid,
        imgName
      );
      console.log(uploadImg);
      if (uploadImg.status == true) {
        if (imgMap[0] == "r") {
          recs.recipeImageID = uploadImg.response;
        } else if (imgMap[0] == "i") {
          recs.ingredientPics.push({
            index: imgMap[1],
            fileID: uploadImg.response,
          });
        } else {
          recs.stepPics.push({
            index: imgMap[1],
            fileID: uploadImg.response,
          });
        }
        await recs.save((err) => {
          if (err) {
            deleteFile(uploadImg.response);
            throw err;
          }
        });
        res.status(201).json({
          status: true,
          message: "Data saved",
          errors: [],
          data: {},
        });
      } else {
        // console.log(error);
        res.status(201).json({
          status: false,
          message: "Unable to update last changes !",
          errors: [],
          data: {},
        });
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
      const uuid = req.body.uuid;
      const recs = await Recipe.findOne({ uuid: req.body.uuid });
    if(req.body.desc){
      let hashtagDeleteString = recs.desc;
      let oldhashtags = hashtagDeleteString.match(/#\w+/g);

      let hashtagString = req.body.desc;
      let hashtag = hashtagString.match(/#\w+/g);
      const toDeleteHashtags = oldhashtags.filter(element => !hashtag.includes(element));
      const toAddHashtags = hashtag.filter(element => !oldhashtags.includes(element))

      // console.log(toDeleteHashtags);
      // console.log(toAddHashtags);

      toDeleteHashtags.forEach(async tag => {
          let tag1 = await Tag.findOne({name: tag});
          if (tag1) {
              tag1.recipe.pop(uuid);
              await tag1.save();
          }
      });
      toAddHashtags.forEach(async tag => {
          let tag1 = await Tag.findOne({name: tag});
          if (tag1) {
              let recips = tag1.recipe;
              recips.push(uuid);
              recips = recips.filter(onlyUnique);
              tag1.recipe = recips;
              await tag1.save();
          }else{
              let tag2 = new Tag({name: tag, recipe: [uuid], post: []});
              await tag2.save();
          }
      });
  }
      updates.forEach((update) => (recs[update] = req.body[update]));
      await recs.save();
      res.status(201).json({
        status: true,
        message: "Data saved",
        errors: [],
        data: {},
      });
    }
  } catch (error) {
    // res.status(500).send(error);
    console.error(error);
    res.status(201).json({
      status: false,
      message: "Unable to update your recipe !!!",
      errors: error,
      data: {},
    });
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const uuid = req.body.uuid;
    const toDelete = await Recipe.findOne({uuid:uuid});
        let hashtagString = toDelete.desc;
            let hashtag = hashtagString.match(/#\w+/g);
            if(hashtag != null){ 
                hashtag = hashtag.filter(onlyUnique);
            
            // let postUuid = req.body.postUuid;
            hashtag.forEach(async tag => {
                let tag1 = await Tag.findOne({name: tag});
                if (tag1) {
                    tag1.post.pop(uuid);
                    await tag1.save();
                }
            });
        }
    await Recipe.findOneAndDelete({ uuid: uuid });
    const del = await deleteFile("recipes/" + req.user.uuid + "/" + uuid);
    if (del.status == true) {
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
};

const resetImage = async (req, res) => {
  try {
    const uuid = req.body.uuid;
    console.log(uuid);
    const imgName = req.body.imgName;
    var temp = imgName.split("_");
    var index = temp[1];
    var key = temp[0];
    var recipe = await Recipe.findOne({ uuid: uuid });
    console.log(recipe);
    let fileID;
    if (key == "r") {
      fileID = recipe.recipeImageID;
    } else if (key == "i") {
      fileID = recipe.ingredientPics.filter((a) => {
        return a.index == index;
      })[0].fileID;
    } else {
      fileID = recipe.stepPics.filter((a) => {
        return a.index == index;
      })[0].fileID;
    }
    console.log("1");
    const del = await deleteFile(fileID);
    if (del.status == true) {
      var recipe = await Recipe.findOne({ uuid: uuid });
      if (key == "r") {
        recipe.url = "";
        recipe.recipeImageID = "";
      } else if (key == "i") {
        recipe.ingredientPics = recipe.ingredientPics.filter((a) => {
          return a.index != index;
        });
      } else {
        recipe.stepPics = recipe.stepPics.filter((a) => {
          return a.index != index;
        });
      }
      console.log("1");
      await recipe.save();
      console.log("1");
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
};

const renameImages = async (req, res) => {
  try{
  const isIngredient = req.body.isIngredient;
  // let index = req.body.index;
  let userUuid = req.user.uuid;
  let recipeUuid = req.body.recipeUuid;
  // const length = req.body.length;
  // let fileprefix = isIngredient ? 'i_' : 's_';
  console.log('1');
  const renameMap = req.body.renameMap;

  console.log(req.body);
  // for (let i = index; i < length; i++) {
  //   const rename = await renameFile(userUuid, recipeUuid, `${fileprefix}${i+1}`, `${fileprefix}${i}`);
  //   if (rename.status == false) {
  //     throw Exception("Error renaming image!");
  //   }
  // }
  console.log('2');

  Object.keys(renameMap).forEach(async (newFile) => {
    const oldFile = renameMap[newFile];
    const rename = await renameFile(userUuid, recipeUuid, oldFile, newFile);
    if (rename.status == false) {
      throw Exception("Error renaming image!");
    }
  });
  // renameMap.forEach(async (newFile, oldFile) => {
  //   console.log('3');
  //   console.log(newFile);
  //   console.log(oldFile);
  //   const rename = await renameFile(userUuid, recipeUuid, oldFile, newFile);
  //   if (rename.status == false) {
  //     throw Exception("Error renaming image!");
  //   }
  // })
  console.log('4');

  res.status(201).json({
    status: true,
    message: "deleted",
    errors: [],
    data: {},
  });
} catch(err) {
  console.log(err);
  res.status(201).json({
    status: false,
    message: "Error deleting",
    errors: [err],
    data: {},
  });
}
  
}

const getIng = (req, res) => {
  try {
    res.status(201).json({
      status: true,
      message: "deleted",
      errors: [],
      data: { ingredients: ingredients },
    });
  } catch (error) {
    res.status(201).json({
      status: false,
      message: "unable to fetch data",
      errors: [],
      data: {},
    });
  }
};

const addBookmark = async (req, res) => {
  // console.log('hello');
  try {
    const userUuid = req.user.uuid;
    const recUuid = req.body.uuid;
    // console.log(postUuid);
    let rec = await Recipe.findOne({ uuid: recUuid });
    console.log(rec);
    if (!rec.bookmarks.includes(userUuid)) {
      rec.bookmarks.push(userUuid);
    }
    let bookmark = await Bookmark.findOne({ userUuid: userUuid });
    if (!bookmark.recipeUuid.includes(recUuid)) {
      bookmark.recipeUuid.push(recUuid);
    }
    // console.log('hello');
    // console.log(post);
    await rec.save();
    await bookmark.save();
    console.log("saved");
    res.status(201).json({
      status: true,
      message: "Bookmarked",
      errors: [],
      data: {},
    });
  } catch (err) {
    console.log(err);
    res.status(201).json({
      status: false,
      message: "error saving it",
      errors: [],
      data: {},
    });
  }
};

const removeBookmark = async (req, res) => {
  try {
    const userUuid = req.user.uuid;
    const recipeUuid = req.body.uuid;
    // console.log(postUuid);
    let rec = await Recipe.findOne({ uuid: recipeUuid });
    let bookmark = await Bookmark.findOne({ userUuid: userUuid });
    // console.log(post);
    // console.log('hello');
    // console.log(post);
    rec.bookmarks.pop(userUuid);
    bookmark.recipeUuid.pop(recipeUuid);
    await rec.save();
    await bookmark.save();
    console.log("saved");
    res.status(201).json({
      status: true,
      message: "Bookmarked",
      errors: [],
      data: {},
    });
  } catch (err) {
    console.log(err);
    res.status(201).json({
      status: false,
      message: "error saving it",
      errors: [],
      data: {},
    });
  }
  // }post.bookmarks.pop(userUuid);
};
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

const addHashtag = async (req, res) => {
try{
  let hashtagString = req.body.desc;
  let hashtag = hashtagString.match(/#\w+/g);
  if (hashtag != null) {
    hashtag = hashtag.filter(onlyUnique);

    let recipeUuid = req.body.uuid;
    let index = 0;
    hashtag.forEach(async (tag) => {
      let tag1 = await Tag.findOne({ name: tag });
      if (tag1) {
        let recipes = tag1.recipe;
        recipes.push(recipeUuid);
        recipes = recipes.filter(onlyUnique);
        tag1.recipe = recipes
        await tag1.save();
      } else {
        let tag2 = new Tag({ name: tag, recipe: [recipeUuid], post: [] });
        await tag2.save();
      }
      index++;
    });
  }
  const rec = await Recipe.findOne({ uuid: req.body.uuid });
  // console.log('2a');
  rec.desc = req.body.desc;
  rec.save((err) => {
    if (!err) {
      res.status(201).json({
        status: true,
        message: "Saved successfully",
        errors: [],
        data: {},
      });
    } else {
      console.log(err);
      res.status(201).json({
        status: false,
        message: "Error while saving",
        errors: [err],
        data: {},
      });
    }
  });
}catch(err){
    console.log(err);
    res.status(201).json({
      status: false,
      message: "Error while saving",
      errors: [err],
      data: {},
    });
  }
};

const getHashtag = async (req, res) => {
  let tag = req.body.tag;
  let suggestion = await Tag.find({ name: { $regex: "^" + tag } }, "-_id name");
  console.log(suggestion);
  res.status(201).json({
    status: true,
    message: "sugesstions",
    errors: [],
    data: suggestion,
  });
};

const getRecipe = async (req, res) => {
  let userUuid = req.user.uuid;
  let chefUuid = req.body.chefUuid;
  let recipeUuid = req.body.uuid;
  let no_of_doc = await Recipe.find({uuid:{$ne: recipeUuid}, userUuid: userUuid}).countDocuments().exec();
  let random = Math.floor(Math.random() * (no_of_doc - 12));
    if (random < 0) {
        random = 0;
    }
  let recipe = await Recipe.findOne({ uuid: recipeUuid },{comments:{$slice:[0,2]},ratings:{$slice:[0,2]}});
  let similar = await Recipe.find({uuid:{$ne: recipeUuid}, userUuid: chefUuid},'-_id uuid userUuid name username recipeImageID createdAt updatedAt').sort('-createdAt').limit(10).skip(random).exec();
  if (recipe) {
    // let recipeUserUuid = recipe.userUuid;
    // let beta = await Recipe.aggregate([{$match: {uuid: {$in: uuids}}},{$project: {comments: { $size:"$comments" }, likes: { $size:"$likes" },"isLiked" : { "$in" : [ uuid, "$likes" ]}, "isBookmarked" : { "$in" : [ uuid, "$bookmarks" ]}}}]).exec()
    // let bookmark = await Bookmark.findOne({userUuid:recipeUserUuid},'-_id subscriber');
    // let isBookmarked;
    // if(bookmark.subscriber.includes(userUuid)){
    //     isBookmarked = true;
    // }
    // else{
    //     isBookmarked = false;
    // }
    let recipeData = await Recipe.aggregate([
      { $match: { uuid: recipeUuid } },
      {
        $project: {
          isLiked: { $in: [userUuid, "$likes"] },
          isBookmarked: { $in: [userUuid, "$bookmarks"] },
          userRating: { $filter: { input: "$ratings", cond: { $eq: ["$$this.uuid", userUuid]}}},
          ratings: { $size: "$ratings" },
          1: {
            $size: {
              $filter: { input: "$ratings", cond: { $eq: ["$$this.star", 1] } },
            },
          },
          2: {
            $size: {
              $filter: { input: "$ratings", cond: { $eq: ["$$this.star", 2] } },
            },
          },
          3: {
            $size: {
              $filter: { input: "$ratings", cond: { $eq: ["$$this.star", 3] } },
            },
          },
          4: {
            $size: {
              $filter: { input: "$ratings", cond: { $eq: ["$$this.star", 4] } },
            },
          },
          5: {
            $size: {
              $filter: { input: "$ratings", cond: { $eq: ["$$this.star", 5] } },
            },
          },
        },
      },
    ]).exec();
    // let userRating = await Recipe.aggregate([{$match: {}}]);
    console.log(recipe);
    if (recipeData != null) {
      let subscribe = await Subscribed.aggregate([{$match: {user: chefUuid}},{$project: {isSubscribed : { "$in" : [ req.user.uuid, "$subscriber" ]}}}]);
      if (subscribe != null) {
        
        if(subscribe.length > 0){
        res.status(201).json({
          status: true,
          message: "suggestions",
          errors: [],
          data: { recipeData: recipeData[0], recipe: recipe, isSubscribed: subscribe[0].isSubscribed, similar: similar},
        });
      } else {
        res.status(201).json({
          status: true,
          message: "suggestions",
          errors: [],
          data: { recipeData: recipeData[0], recipe: recipe, isSubscribed: false, similar: similar},
        });
      }
      }
      else {
        console.log(err);
        res.status(201).json({
          status: false,
          message: "Error",
          errors: [err],
          data: {},
        });
      }
      
    } else {
      console.log(err);
      res.status(201).json({
        status: false,
        message: "Error",
        errors: [err],
        data: {},
      });
    }
  } else {
    console.log(err);
    res.status(201).json({
      status: false,
      message: "Error while fetching",
      errors: [err],
      data: {},
    });
  }

  // if(await Bookmark.findOne({}))
};

const loadcomment = (req, res) => {
  res.status(201).json({
    status: true,
    message: "",
    errors: [],
    data: { comments: res.paginatedComments },
  });
};

const loadrating = (req, res) => {
  res.status(201).json({
    status: true,
    message: "",
    errors: [],
    data: { ratings: res.paginatedComments },
  });
};

// const getRating = (req, res) => {
//     let recipeUuid = req.body.uuid;

// }

const addComment = async (req,res) => {
  try {
      
  
  // console.log(req.body);
  const comment = req.body.comment;
  const recipeUuid = req.body.recipeUuid;
  const username = req.user.username;
  const commentUuid = req.user.uuid+'_comment_'+uuidv4();
  var recs = await Recipe.findOne({uuid:recipeUuid});
  if(recs != null) {
      recs.comments.push({uuid:commentUuid,username:username,comment:comment, profilePic: req.user.profilePic});
  await recs.save();
  res.status(201).json({
      status: true,
      message: "Comment added",
      errors: [],
      data: {},
  });
  } else {
      res.status(201).json({
          status: false,
          message: "Unable to add comment",
          errors: [],
          data: {},
      });
  }
  } catch (error) {
      res.status(201).json({
          status: false,
          message: "Unable to add comment",
          errors: [],
          data: {},
      });    
  }
  
}

const removeComment = async (req,res) => {
  const recipeUuid = req.body.recipeUuid;
  const commentUuid = req.body.commentUuid;
  var recs = await Recipe.findOne({uuid:recipeUuid});
  recs.comments = recs.comments.filter((a) => {return a.uuid != commentUuid});
  await recs.save();
  res.status(201).json({
      status: true,
      message: "Comment added",
      errors: [],
      data: {},
  });
}


const addLike = async (req,res) => {
  // console.log('hello');
  try{
  const userUuid = req.user.uuid;
  const recipeUuid = req.body.uuid;
  // console.log(postUuid);
  const recs = await Recipe.findOne({uuid:recipeUuid});
  // console.log(post);
  if(!recs.likes.includes(userUuid)){
      recs.likes.push(userUuid);
  }
  // console.log('hello');
  // console.log(post);
  await recs.save();
  console.log('saved');
  res.status(201).json({
      status: true,
      message: "Liked",
      errors: [],
      data: {},
    });
  }catch(err){
      console.log(err);
      res.status(201).json({
          status: false,
          message: "error liking it",
          errors: [],
          data: {},
        });
  }

}
const removeLike = async (req,res) => {
  try{
  const userUuid = req.user.uuid;
  const recipeUuid = req.body.uuid;
  const recs = await Recipe.findOne({uuid:recipeUuid});
  recs.likes.pop(userUuid);
  await recs.save();
  res.status(201).json({
      status: true,
      message: "Unliked",
      errors: [],
      data: {},
      });
  }catch(err){
      res.status(201).json({
          status: false,
          message: "error unliking it",
          errors: [err],
          data: {},
          });
  }
}


const addRating = async (req,res) => {
  let userUuid = req.user.uuid;
  let recipeUuid = req.body.uuid;
  let recs = await Recipe.findOne({uuid:recipeUuid});
  
  
  if(recs!=null && req.body.star != null){
    recs.ratings = recs.ratings.filter((a) => {
      return a.uuid != userUuid;
    })
    recs.ratings.push({uuid:userUuid,username:req.user.username,star:req.body.star,profilePic:req.user.profilePic,});
    recs.save();
    res.status(201).json({
      status: true,
      message: "rated",
      errors: [],
      data: {},
      });
  }else{
    res.status(201).json({
      status: false,
      message: "error",
      errors: [],
      data: {},
      });
  }
}

const resetRating = async (req,res) => {
  let userUuid = req.user.uuid;
  let recipeUuid = req.body.uuid;
  let recs = await Recipe.findOne({uuid:recipeUuid});

  if(recs!=null && req.body.star != null){
    recs.ratings = recs.ratings.filter((a) => {
      return a.uuid != userUuid;
    })
    
    recs.save();
    res.status(201).json({
      status: true,
      message: "rated",
      errors: [],
      data: {},
      });
  }else{
    res.status(201).json({
      status: false,
      message: "error",
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
  resetImage,
  renameImages,
  addBookmark,
  removeBookmark,
  addHashtag,
  getHashtag,
  getRecipe,
  loadcomment,
  loadrating,
  addComment,
  removeComment,
  addLike,
  removeLike,
  addRating,
  resetRating,
};
