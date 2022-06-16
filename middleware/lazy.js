const User = require("../models/users.js");
const Post = require("../models/post.js");
const Subscribed = require("../models/subscribed.js");
const Recipe = require("../models/recipe.js");
const Suggestion = require("../models/suggestion.js");
const Tag = require("../models/tag.js");
const Bookmark = require("../models/bookmarks.js");
const mongoose=require('mongoose');
// const Recipe = require("../models/recipe.js");


function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}


const lazyfeed = async (req,res,next) => {
  try {
    const page = parseInt(req.params.page);
    // console.log(page);
    const limit = 2;
    const startIndex = (page - 1)*limit;
    // console.log(startIndex);
    const endIndex = page*limit;
    const results = {};
    // console.log(endIndex);
    let uuid = req.user.uuid;
    const found = await Subscribed.findOne({user:uuid},'-_id subscribed');
    // console.log(found);
    if(!found || found.subscribed.length == 0) {
      // console.log('henlo');
      next();
    } else {
      // console.log(found.subscribed);
      // console.log('1');
    // console.log(await Post.find({userUuid:{$in: found.subscribed}},'-_id username profilePic url createdAt updatedAt'));
    // if (endIndex < await Post.find({userUuid:{$in: found.subscribed}}).sort('-createdAt').countDocuments().exec()) {
      if (endIndex < await Post.find({userUuid:{$in: found.subscribed}}).countDocuments().exec()) {
        results.next = {
          page: page + 1,
          limit: limit
        }
      }
      // console.log('2');
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit
        }
      }
      // console.log('3');
      
        // console.log(startIndex);
        // let x = await Post.aggregate([{$match: {userUuid:{$in: found.subscribed}}},{$project: {count: { $size:"$comments" }}},{ $limit:limit },{ $skip:1 }]).exec()
        // console.log(x);
        results.results = await Post.find({userUuid:{$in: found.subscribed}},'-_id uuid userUuid username profilePic url postID description createdAt updatedAt').sort('-createdAt').limit(limit).skip(startIndex).exec();
        // if(await Post.findOne({userUuid:{$in: found.subscribed}},'-_id likes').sort('-createdAt').limit(limit).skip(startIndex).exec()){}
        // results.results['noOfComments'] = x.count;
        // console.log(results.results);
        let uuids = [];
        // console.log('4');
        if(results.results.length == 0){
          res.paginatedResults = results;
          next();
        } else {
          await results.results.forEach(async element => {
            uuids.push(element.uuid);
            
            // console.log(uuids);
            if(results.results.indexOf(element) == results.results.length-1) {
              // let beta = await Post.aggregate([{$match: {uuid: {$in: uuids}}},{$project: {comments: { $size:"$comments" }, likes: { $size:"$likes" },"isLiked" : { "$in" : [ uuid, "$likes" ]}, "isBookmarked" : { "$in" : [ uuid, "$bookmarks" ]}}}]).exec()
              let x = await Post.aggregate([{$match: {uuid: {$in: uuids}}},{$project: {count: { $size:"$comments" }}}]).exec()
              let y = await Post.aggregate([{$match: {uuid: {$in: uuids}}},{$project: {count: { $size:"$likes" }, "isLiked" : { "$in" : [ uuid, "$likes" ]}}}]).exec()
              let z = await Post.aggregate([{$match: {uuid: {$in: uuids}}},{$project: {"isBookmarked" : { "$in" : [ uuid, "$bookmarks" ]}}}]).exec()
              results.noOfComments = x;
              results.noOfLikes = y;
              results.bookmarks = z;
              // results.beta = beta
              // console.log(beta);
              res.paginatedResults = results;
              // console.log(results);
              next()
            }
          });
        }
        
        
      
    }
    
        
        
      } catch (e) {
        // res.status(500).json({ message: e.message })
        res.status(201).json({
            status: false,
            message: "failed to load feed",
            errors: [],
            data: {posts: []},
          })
      }
    
}

const lazycomment = async (req,res,next) => {
  try {
  const page = parseInt(req.params.page);
  // console.log(page);
  const limit = 2;
  const startIndex = (page - 1)*limit;
  // console.log(startIndex);
  const endIndex = page*limit;
  const results = {}
  userUuid = req.params.userUuid;
  uuid = req.params.uuid;

  let x = await Post.aggregate([{$match: {userUuid:userUuid,uuid:uuid}},{$project: { count: { $size:"$comments" }}},{$limit:1}]).exec()
  // console.log(x.count);
  // let comments = await Post.findOne({userUuid:userUuid,uuid:uuid},'-_id comments')
  // console.log(comments);
  if (endIndex < x[0].count) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }

    
      // console.log(startIndex);
      results.results = await Post.findOne({userUuid:userUuid,uuid:uuid},{comments:{$slice:[startIndex,limit]},_id:0,uuid:0,username:0,profilePic:0,userUuid:0,description:0,url:0,likes:0,createdAt:0,updatedAt:0}).exec();
      // console.log(results.results);
      res.paginatedComments = results
      next()
    } catch (e) {
      console.log(e)
      res.status(201).json({
          status: false,
          message: "failed to load feed",
          errors: [],
          data: {comments: []},
        })
    }
  
}

const lazyrec = async (req, res, next) => {
  try {
  const page = parseInt(req.params.page);
    // console.log(page);
    const limit = 4;
    const startIndex = (page - 1)*limit;
    // console.log(startIndex);
    const endIndex = page*limit;
    const results = {};

    let uuid = req.user.uuid;
    const found = await Subscribed.findOne({user:uuid},'-_id subscribed')
    if(!found) {
      console.log('henlo');
      next()
    } else {

    
    // console.log(await Post.find({userUuid:{$in: found.subscribed}}).countDocuments().exec());
    if (endIndex < await Recipe.find({userUuid:{$in: found.subscribed}}).countDocuments().exec()) {
        results.next = {
          page: page + 1,
          limit: limit
        }
      }

      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit
        }
      }
        // console.log(startIndex);
        results.results = await Recipe.find({userUuid:{$in: found.subscribed}}).sort('-createdAt').limit(limit).skip(startIndex).exec();

        let uuids = [];
        // console.log('4');
        if(results.results.length == 0){
          res.paginatedResults = results;
          next();
        } else {
          await results.results.forEach(async element => {
            uuids.push(element.uuid);
            
            // console.log(uuids);
            if(results.results.indexOf(element) == results.results.length-1) {
              let beta = await Recipe.aggregate([{$match: {uuid: {$in: uuids}}},{$project: {"isBookmarked" : { "$in" : [ uuid, "$bookmarks" ]}}}]).exec()
              results.recipeData = beta;
              // console.log(beta);
              res.paginatedResults = results;
              // console.log(res.paginatedResults);
              next()
            }
          });
        }
    }
      } catch (e) {
        // res.status(500).json({ message: e.message })
        res.status(201).json({
            status: false,
            message: "failed to load recs",
            errors: [],
            data: {recs: []},
          })
      }
}

const lazyguess = async (req, res, next) => {
  try {
  const page = parseInt(req.params.page);
    // console.log(page);
    const limit = 4;
    const startIndex = (page - 1)*limit;
    // console.log(startIndex);
    const endIndex = page*limit;
    const results = {};
    let uuids = [];
    const id = req.params.id;
    const found = await Suggestion.findById(id);
    if(!found) {
      console.log('henlo');
      res.status(201).json({
        status: false,
        message: "Try again. Yumminess waiting for you!!",
        errors: [],
        data: {recs: []},
      });
    } else {
      
      let x = await Suggestion.aggregate([{$match: {_id:new mongoose.Types.ObjectId(id)}},{$project: { count: { $size:"$suggest" }}},{$limit:1}]).exec()
    // console.log(await Post.find({userUuid:{$in: found.subscribed}}).countDocuments().exec());
    if (endIndex < x[0].count) {
        results.next = {
          page: page + 1,
          limit: limit
        }
      }

      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit
        }
      }

      results.results = await Suggestion.findById(id,{comments:{$slice:[startIndex,limit]}}).exec();
      await found.suggest.forEach(async (element) => {
        uuids.push(element.uuid);
        if(found.suggest.indexOf(element) == found.suggest.length-1) {
          let beta = await Recipe.aggregate([{$match: {uuid: {$in: uuids}}},{$project: {"isBookmarked" : { "$in" : [ req.user.uuid, "$bookmarks" ]}}}]).exec()
          results.recipeData = beta;
          console.log('nike');
          console.log(results.results);
          res.paginatedResults = results;
            // console.log(startIndex);
            // results.results = await Suggestion.find({userUuid:{$in: found.subscribed}}).sort('-createdAt').limit(limit).skip(startIndex).exec();
            // res.paginatedResults = results
            next();
        }
      });
      

    }
      } catch (e) {
        // res.status(500).json({ message: e.message })
        console.log(e);
        res.status(201).json({
            status: false,
            message: "failed to load recs",
            errors: [],
            data: {recs: []},
          })
      }
}

const lazyexplore = async (req,res,next) => {
  try {
    const page = parseInt(req.params.page);
    const limit = 3;
    const startIndex = (page - 1)*limit;
    const endIndex = page*limit;
    const results = {};
    let shuffledIndex = [];
    // let shuffledIndex = shuffle([((page-1)*6) + 0,((page-1)*6) + 1,((page-1)*6) + 2,((page-1)*6) + 3,((page-1)*6) + 4,((page-1)*6) + 5]);
    let uuid = req.user.uuid;
   
    if (endIndex < (await Post.find({}).countDocuments().exec() + await Recipe.find({}).countDocuments().exec())) {
        results.next = {
          page: page + 1,
          limit: limit
        }
      }
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit
        }
      }
        var temp = await Post.find({userUuid: {$ne: uuid}},'-_id uuid userUuid username profilePic url description createdAt updatedAt postID isPost').sort('-createdAt').limit(limit).skip(startIndex).exec();
        var temp2 = await Recipe.find({userUuid: {$ne: uuid}}).sort('-createdAt').limit(limit).skip(startIndex).exec();
        results.results = temp.concat(temp2);
        // results.results = await Post.find({},'-_id uuid userUuid username profilePic url description createdAt updatedAt isPost').sort('-createdAt').limit(limit).skip(startIndex).exec();
        let uuids_1 = [];
        let uuids_2 = [];
        if(results.results.length == 0){
          res.paginatedResults = results;
          next();
        } else {
          await results.results.forEach(async element => {
            if(element.isPost){
              uuids_1.push(element.uuid);
            } else {
              uuids_2.push(element.uuid);
            }
            if(results.results.indexOf(element) == results.results.length-1) {
              let alpha = await Post.aggregate([{$match: {uuid: {$in: uuids_1}}},{$project: {comments: { $size:"$comments" }, likes: { $size:"$likes" },"isLiked" : { "$in" : [ uuid, "$likes" ]}, "isBookmarked" : { "$in" : [ uuid, "$bookmarks" ]}}}]).exec()
              let beta = await Recipe.aggregate([{$match: {uuid: {$in: uuids_2}}},{$project: {comments: { $size:"$comments" }, likes: { $size:"$likes" },"isLiked" : { "$in" : [ uuid, "$likes" ]}, "isBookmarked" : { "$in" : [ uuid, "$bookmarks" ]}}}]).exec()
              results.data = alpha.concat(beta);
              for (let index = 0; index < results.results.length; index++) {
                // shuffledIndex.push(((page-1)*results.results.length) + index);
                shuffledIndex.push(((page-1)*req.params.previousLength) + index);
              }
              results.indices = shuffle(shuffledIndex);
              res.paginatedResults = results;
              console.log(res.paginatedResults);
              next()
            }
          });
        }
        // results.results = 
      } catch (e) {
        res.status(201).json({
            status: false,
            message: "failed to load feed",
            errors: [],
            data: {posts: []},
          })
      }
}


const lazyall = async (req,res,next) => {
  try {
    const page = parseInt(req.params.page);
    const limit = 8;
    const startIndex = (page - 1)*limit;
    const endIndex = page*limit;
    const results = {};
    // let shuffledIndex = shuffle([((page-1)*6) + 0,((page-1)*6) + 1,((page-1)*6) + 2,((page-1)*6) + 3,((page-1)*6) + 4,((page-1)*6) + 5]);
    let uuid = req.user.uuid;
    let phrase = req.params.word;
    console.log(phrase);
    if (endIndex < (await User.find({$or:[{"name": {$regex: phrase, $options:'i'}},{"username": {$regex: phrase}}],userUuid: {$ne: uuid}}).countDocuments().exec() + await Recipe.find({"name": {$regex: phrase, $options:'i'},userUuid: {$ne: uuid}}).countDocuments().exec() + await Tag.find({"name": {$regex:'^'+phrase, $options:'i'}}).countDocuments().exec())) {
        results.next = {
          page: page + 1,
          limit: limit
        }
      }
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit
        }
      }
      console.log('1A')
      let users = await User.find({$or:[{"name": {$regex: phrase, $options:'i'}},{"username": {$regex: phrase}}],userUuid: {$ne: uuid}},'-_id name uuid username profilePic').limit(limit).skip(startIndex).exec();
      console.log('2B')
      let recs = await Recipe.find({"name": {$regex: phrase, $options:'i'},userUuid: {$ne: uuid}},'-_id name uuid username recipeImageID').limit(limit).skip(startIndex).exec();
      console.log('3C')
      let tags = await Tag.find({"name": {$regex:'^'+phrase, $options:'i'}},'-_id name').limit(limit).skip(startIndex).exec();
      console.log('4D')
      if(users.concat(recs.concat(tags)).length == 0){
          console.log('5E')
          res.paginatedResults = results;
          next();
        } else {
          results.users = users;
          results.recs = recs;
          results.tags = tags;
          console.log('6F')
          res.paginatedResults = results;
          next();
        } 
      } catch (e) {
        console.log(e);
        res.status(201).json({
            status: false,
            message: "failed to load feed",
            errors: [],
            data: {posts: []},
          })
      }
}

const lazyprofile = async (req,res,next) => {
  try {
    const page = parseInt(req.params.page);
    const limit = 9;
    const startIndex = (page - 1)*limit;
    const endIndex = page*limit;
    const results = {};
    // let shuffledIndex = shuffle([((page-1)*6) + 0,((page-1)*6) + 1,((page-1)*6) + 2,((page-1)*6) + 3,((page-1)*6) + 4,((page-1)*6) + 5]);

    let uuid;
    if(req.params.uuid == "user") {
      uuid = req.user.uuid;
    }else{
      uuid = req.params.uuid;
    }
  //  let phrase = req.params.word;
    if (endIndex < (await Recipe.find({userUuid:uuid}).countDocuments().exec() + await Post.find({userUuid:uuid}).countDocuments().exec())) {
        results.next = {
          page: page + 1,
          limit: limit
        }
      }
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit
        }
      }
      
      // let users = await User.find({$or:[{"name": {$regex: phrase, $options:'i'}},{"username": {$regex: phrase}}]},'-_id name uuid username profilePic').limit(limit).skip(startIndex).exec();
      let recs = await Recipe.find({userUuid:uuid},'-_id name uuid recipeImageID userUuid').limit(limit).skip(startIndex).exec();
      let posts = await Post.find({userUuid:uuid},'-_id name uuid postID').limit(limit).skip(startIndex).exec();

      if(recs.concat(posts).length == 0){
          res.paginatedResults = results;
          next();
        } else {
          // results.users = users;
          results.recs = recs;
          results.posts = posts;
          res.paginatedResults = results;
          // console.log(results);
          next();
        }
        // results.results = 
      } catch (e) {
        console.log(e);
        res.status(201).json({
            status: false,
            message: "failed to load profile",
            errors: [],
            data: {posts: []},
          })
      }
}

const lazyprofilepost = async (req,res,next) => {
  try {
    const page = parseInt(req.params.page);
    const limit = 9;
    const startIndex = (page - 1)*limit;
    const endIndex = page*limit;
    const results = {};
    // let shuffledIndex = shuffle([((page-1)*6) + 0,((page-1)*6) + 1,((page-1)*6) + 2,((page-1)*6) + 3,((page-1)*6) + 4,((page-1)*6) + 5]);
    let uuid;
    if(req.params.uuid == "user") {
      uuid = req.user.uuid;
    }else{
      uuid = req.params.uuid;
    }
  //  let phrase = req.params.word;
    if (endIndex < (await Post.find({userUuid:uuid}).countDocuments().exec())) {
        results.next = {
          page: page + 1,
          limit: limit
        }
      }
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit
        }
      }
      
      // let users = await User.find({$or:[{"name": {$regex: phrase, $options:'i'}},{"username": {$regex: phrase}}]},'-_id name uuid username profilePic').limit(limit).skip(startIndex).exec();
      // let recs = await Recipe.find({userUuid:uuid},'-_id name uuid recipeImageID').limit(limit).skip(startIndex).exec();
      let posts = await Post.find({userUuid:uuid},'-_id name uuid postID userUuid').limit(limit).skip(startIndex).exec();
      console.log(posts);
      if(posts.length == 0){
          res.paginatedResults = results;
          next();
        } else {
          // results.users = users;
          // results.recs = recs;
          results.posts = posts;
          res.paginatedResults = results;
          // console.log(results);
          next();
        }
        // results.results = 
      } catch (e) {
        console.log(e);
        res.status(201).json({
            status: false,
            message: "failed to load profile",
            errors: [],
            data: {posts: []},
          })
      }
}

const lazyprofilerecs = async (req,res,next) => {
  try {
    const page = parseInt(req.params.page);
    const limit = 9;
    const startIndex = (page - 1)*limit;
    const endIndex = page*limit;
    const results = {};
    // let shuffledIndex = shuffle([((page-1)*6) + 0,((page-1)*6) + 1,((page-1)*6) + 2,((page-1)*6) + 3,((page-1)*6) + 4,((page-1)*6) + 5]);
    let uuid;
    if(req.params.uuid == "user") {
      uuid = req.user.uuid;
    }else{
      uuid = req.params.uuid;
    }
  //  let phrase = req.params.word;
    if (endIndex < (await Recipe.find({userUuid:uuid}).countDocuments().exec())) {
        results.next = {
          page: page + 1,
          limit: limit
        }
      }
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit
        }
      }
      
      // let users = await User.find({$or:[{"name": {$regex: phrase, $options:'i'}},{"username": {$regex: phrase}}]},'-_id name uuid username profilePic').limit(limit).skip(startIndex).exec();
      let recs = await Recipe.find({userUuid:uuid},'-_id name uuid recipeImageID userUuid').limit(limit).skip(startIndex).exec();
      // let posts = await Post.find({userUuid:uuid},'-_id name uuid postID').limit(limit).skip(startIndex).exec();
      console.log(recs);
      if(recs.length == 0){
          res.paginatedResults = results;
          next();
        } else {
          // results.users = users;
          results.recs = recs;
          // results.posts = posts;
          res.paginatedResults = results;
          // console.log(results);
          next();
        }
        // results.results = 
      } catch (e) {
        console.log(e);
        res.status(201).json({
            status: false,
            message: "failed to load profile",
            errors: [],
            data: {posts: []},
          })
      }
}


const lazybookmark = async (req,res,next) => {
  try {
    const page = parseInt(req.params.page);
    const limit = 9;
    const startIndex = (page - 1)*limit;
    const endIndex = page*limit;
    const results = {};
    // let shuffledIndex = shuffle([((page-1)*6) + 0,((page-1)*6) + 1,((page-1)*6) + 2,((page-1)*6) + 3,((page-1)*6) + 4,((page-1)*6) + 5]);
    let uuid = req.user.uuid;
  //  let phrase = req.params.word;
    if (endIndex < (await Recipe.find({userUuid:uuid}).countDocuments().exec() + await Post.find({userUuid:uuid}).countDocuments().exec())) {
        results.next = {
          page: page + 1,
          limit: limit
        }
      }
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit
        }
      }
      let bookmarks = await Bookmark.findOne({userUuid:uuid},'-_id recipeUuid postUuid')
      let recipeUuid = bookmarks.recipeUuid;
      let postUuid = bookmarks.postUuid;
      // let users = await User.find({$or:[{"name": {$regex: phrase, $options:'i'}},{"username": {$regex: phrase}}]},'-_id name uuid username profilePic').limit(limit).skip(startIndex).exec();
      let recs = await Recipe.find({ uuid: {$in: recipeUuid }},'-_id name uuid recipeImageID userUuid username').limit(limit).skip(startIndex).exec();
      let posts = await Post.find({ uuid: {$in: postUuid }},'-_id name uuid postID userUuid username').limit(limit).skip(startIndex).exec();
      // let alpha = await Post.aggregate([{"$in" : [ uuid, "$bookmarks" ]}]).exec()
      // console.log(alpha);

      if(recs.concat(posts).length == 0){
          res.paginatedResults = results;
          next();
        } else {
          // results.users = users;
          results.recs = recs;
          results.posts = posts;
          res.paginatedResults = results;
          console.log(results);
          next();
        }
        // results.results = 
      } catch (e) {
        console.log(e);
        res.status(201).json({
            status: false,
            message: "failed to load profile",
            errors: [],
            data: {posts: []},
          })
      }
}


const lazyreccomment = async (req,res,next) => {
  try {
  const page = parseInt(req.params.page);
  // console.log(page);
  const limit = 10;
  const startIndex = (page - 1)*limit;
  // console.log(startIndex);
  const endIndex = page*limit;
  const results = {}
  userUuid = req.params.userUuid;
  uuid = req.params.uuid;

  let x = await Recipe.aggregate([{$match: {userUuid:userUuid,uuid:uuid}},{$project: { count: { $size:"$comments" }}},{$limit:1}]).exec()
  // console.log(x.count);
  // let comments = await Post.findOne({userUuid:userUuid,uuid:uuid},'-_id comments')
  // console.log(comments);
  if (endIndex < x[0].count) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }

      // console.log(startIndex);
      results.results = await Recipe.findOne({userUuid:userUuid,uuid:uuid},{comments:{$slice:[startIndex,limit]},_id:0,uuid:0,username:0,profilePic:0,userUuid:0,description:0,url:0,likes:0,createdAt:0,updatedAt:0}).exec();
      // console.log(results.results);
      res.paginatedComments = results
      next()
    } catch (e) {
      console.log(e)
      res.status(201).json({
          status: false,
          message: "failed to load feed",
          errors: [],
          data: {comments: []},
        })
    }
  
}

const lazyrating = async (req,res,next) => {
  try {
  const page = parseInt(req.params.page);
  // console.log(page);
  const limit = 2;
  const startIndex = (page - 1)*limit;
  // console.log(startIndex);
  const endIndex = page*limit;
  const results = {}
  userUuid = req.params.userUuid;
  uuid = req.params.uuid;

  let x = await Recipe.aggregate([{$match: {userUuid:userUuid,uuid:uuid}},{$project: { count: { $size:"$ratings" }}},{$limit:1}]).exec()
  // console.log(x.count);
  // let comments = await Post.findOne({userUuid:userUuid,uuid:uuid},'-_id comments')
  // console.log(comments);
  if (endIndex < x[0].count) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }

      // console.log(startIndex);
      results.results = await Recipe.findOne({userUuid:userUuid,uuid:uuid},{ratings:{$slice:[startIndex,limit]},_id:0,uuid:0,username:0,profilePic:0,userUuid:0,description:0,url:0,likes:0,createdAt:0,updatedAt:0}).exec();
      // console.log(results.results);
      res.paginatedComments = results
      next()
    } catch (e) {
      console.log(e)
      res.status(201).json({
          status: false,
          message: "failed to load feed",
          errors: [],
          data: {comments: []},
        })
    }
  
}


const lazysubscribers = async (req,res,next) => {
  try {
  const page = parseInt(req.params.page);
  // console.log(page);
  const limit = 10;
  const startIndex = (page - 1)*limit;
  // console.log(startIndex);
  const endIndex = page*limit;
  const results = {}
  const userUuid = req.params.userUuid;

  let x = await Subscribed.aggregate([{$match: {user:userUuid}},{$project: { count: { $size:"$subscriber" }}},{$limit:1}]).exec()
  // console.log(x.count);
  // let comments = await Post.findOne({userUuid:userUuid,uuid:uuid},'-_id comments')
  // console.log(comments);
  if (endIndex < x[0].count) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }

      // console.log(startIndex);
      // console.log('1');
      const resp = await Subscribed.findOne({user:userUuid},{subscriber:{$slice:[startIndex,limit]}, _id: 0}).exec();
      // console.log('2');
      const subscribers = resp.subscriber;
      // console.log('3');
      let users = [];
      if(subscribers.length == 0) {
        next()
      } else {
        for (let index = 0; index < subscribers.length; index++) {
          const user = await User.findOne({uuid: subscribers[index]},'-_id name username uuid profilePic');     
          users.push(user); 
          // console.log('4');
          // console.log(index);
          if(index == subscribers.length-1) {
            results.subscribers = users;
            res.paginatedResults = results
            // console.log(users);
            // console.log(res);
            next()
          }
        }
      }
      // console.log("aya jovanu che");
      // console.log(results.results);
      // res.paginatedResults = results
    } catch (e) {
      console.log(e)
      res.status(201).json({
          status: false,
          message: "failed to load subscribers",
          errors: [],
          data: {subscribers: []},
        })
    }
  
}

const lazysubscribeds = async (req,res,next) => {
  try {
  const page = parseInt(req.params.page);
  // console.log(page);
  const limit = 10;
  const startIndex = (page - 1)*limit;
  // console.log(startIndex);
  const endIndex = page*limit;
  const results = {}
  const userUuid = req.params.userUuid;

  let x = await Subscribed.aggregate([{$match: {user:userUuid}},{$project: { count: { $size:"$subscribed" }}},{$limit:1}]).exec()
  // console.log(x.count);
  // let comments = await Post.findOne({userUuid:userUuid,uuid:uuid},'-_id comments')
  // console.log(comments);
  if (endIndex < x[0].count) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }

      // console.log(startIndex);
      // console.log('1');
      const resp = await Subscribed.findOne({user:userUuid},{subscribed:{$slice:[startIndex,limit]}, _id: 0}).exec();
      // console.log('2');
      const subscribers = resp.subscribed;
      // console.log('3');
      let users = [];
      if(subscribers.length == 0) {
        next()
      } else {
        for (let index = 0; index < subscribers.length; index++) {
          const user = await User.findOne({uuid: subscribers[index]},'-_id name username uuid profilePic');     
          users.push(user); 
          // console.log('4');
          // console.log(index);
          if(index == subscribers.length-1) {
            results.subscribers = users;
            res.paginatedResults = results
            // console.log(users);
            // console.log(res);
            next()
          }
        }
      }
      // console.log("aya jovanu che");
      // console.log(results.results);
      // res.paginatedResults = results
    } catch (e) {
      console.log(e)
      res.status(201).json({
          status: false,
          message: "failed to load followers",
          errors: [],
          data: {subscribers: []},
        })
    }
  
}

const lazyhashtag = async (req,res,next) => {
  try {
    const page = parseInt(req.params.page);
    const limit = 3;
    const startIndex = (page - 1)*limit;
    const endIndex = page*limit;
    const results = {};
    let shuffledIndex = [];
    // let shuffledIndex = shuffle([((page-1)*6) + 0,((page-1)*6) + 1,((page-1)*6) + 2,((page-1)*6) + 3,((page-1)*6) + 4,((page-1)*6) + 5]);
    let uuid = req.user.uuid;
   
    if (endIndex < (await Post.find({}).countDocuments().exec() + await Recipe.find({}).countDocuments().exec())) {
        results.next = {
          page: page + 1,
          limit: limit
        }
      }
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit
        }
      }
        var temp = await Post.find({userUuid: {$ne: uuid}},'-_id uuid userUuid username profilePic url description createdAt updatedAt postID isPost').sort('-createdAt').limit(limit).skip(startIndex).exec();
        var temp2 = await Recipe.find({userUuid: {$ne: uuid}}).sort('-createdAt').limit(limit).skip(startIndex).exec();
        results.results = temp.concat(temp2);
        // results.results = await Post.find({},'-_id uuid userUuid username profilePic url description createdAt updatedAt isPost').sort('-createdAt').limit(limit).skip(startIndex).exec();
        let uuids_1 = [];
        let uuids_2 = [];
        if(results.results.length == 0){
          res.paginatedResults = results;
          next();
        } else {
          await results.results.forEach(async element => {
            if(element.isPost){
              uuids_1.push(element.uuid);
            } else {
              uuids_2.push(element.uuid);
            }
            if(results.results.indexOf(element) == results.results.length-1) {
              let alpha = await Post.aggregate([{$match: {uuid: {$in: uuids_1}}},{$project: {comments: { $size:"$comments" }, likes: { $size:"$likes" },"isLiked" : { "$in" : [ uuid, "$likes" ]}, "isBookmarked" : { "$in" : [ uuid, "$bookmarks" ]}}}]).exec()
              let beta = await Recipe.aggregate([{$match: {uuid: {$in: uuids_2}}},{$project: {comments: { $size:"$comments" }, likes: { $size:"$likes" },"isLiked" : { "$in" : [ uuid, "$likes" ]}, "isBookmarked" : { "$in" : [ uuid, "$bookmarks" ]}}}]).exec()
              results.data = alpha.concat(beta);
              for (let index = 0; index < results.results.length; index++) {
                // shuffledIndex.push(((page-1)*results.results.length) + index);
                shuffledIndex.push(((page-1)*req.params.previousLength) + index);
              }
              results.indices = shuffle(shuffledIndex);
              res.paginatedResults = results;
              console.log(res.paginatedResults);
              next()
            }
          });
        }
        // results.results = 
      } catch (e) {
        res.status(201).json({
            status: false,
            message: "failed to load feed",
            errors: [],
            data: {posts: []},
          })
      }
}


module.exports = {
    lazyfeed,
    lazycomment,
    lazyrec,
    lazyguess,
    lazyexplore,
    lazyall,
    lazyprofile,
    lazybookmark,
    lazyprofilepost,
    lazyprofilerecs,
    lazyreccomment,
    lazyrating,
    lazysubscribers,
    lazysubscribeds
}