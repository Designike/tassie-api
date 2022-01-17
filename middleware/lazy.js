const User = require("../models/users.js");
const Post = require("../models/post.js");
const Subscribed = require("../models/subscribed.js");
const Recs = require("../models/recipe.js");

const lazyfeed = async (req,res,next) => {
    const page = parseInt(req.params.page);
    // console.log(page);
    const limit = 1;
    const startIndex = (page - 1)*limit;
    // console.log(startIndex);
    
    const endIndex = page*limit;
    const results = {}
    // console.log(endIndex);
    uuid = req.user.uuid;
    const found = await Subscribed.findOne({user:uuid},'-_id subscribed')
    
    // console.log(await Post.find({userUuid:{$in: found.subscribed}},'-_id username profilePic url createdAt updatedAt'));
    if (endIndex < await Post.find({userUuid:{$in: found.subscribed}}).sort('-createdAt').countDocuments().exec()) {
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

      try {
        // console.log(startIndex);
        // let x = await Post.aggregate([{$match: {userUuid:{$in: found.subscribed}}},{$project: {count: { $size:"$comments" }}},{ $limit:limit },{ $skip:1 }]).exec()
        // console.log(x);
        results.results = await Post.find({userUuid:{$in: found.subscribed}},'-_id uuid userUuid username profilePic url createdAt updatedAt').sort('-createdAt').limit(limit).skip(startIndex).exec();
        // results.results['noOfComments'] = x.count;
        // console.log(results.results);
        let uuids = [];
        
        if(results.results.length == 0){
          res.paginatedResults = results;
          next()
        }
        
        await results.results.forEach(async element => {
          uuids.push(element.uuid);
          
          // console.log(element);
          if(results.results.indexOf(element) == results.results.length-1) {
            let x = await Post.aggregate([{$match: {uuid:element.uuid}},{$project: {count: { $size:"$comments" }}}]).exec()
            results.noOfComments = x;
            // console.log(results);
            res.paginatedResults = results;
            next()
          }
        });
      
        
        
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

    try {
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
  const page = parseInt(req.params.page);
    // console.log(page);
    const limit = 4;
    const startIndex = (page - 1)*limit;
    // console.log(startIndex);
    const endIndex = page*limit;
    const results = {};

    uuid = req.user.uuid;
    const found = await Subscribed.findOne({user:uuid},'-_id subscribed')
    // console.log(await Post.find({userUuid:{$in: found.subscribed}}).countDocuments().exec());
    if (endIndex < await Recs.find({userUuid:{$in: found.subscribed}}).sort('-createdAt').countDocuments().exec()) {
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

      try {
        // console.log(startIndex);
        results.results = await Recs.find({userUuid:{$in: found.subscribed}}).sort('-createdAt').limit(limit).skip(startIndex).exec();
        res.paginatedResults = results
        next()
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

module.exports = {
    lazyfeed,
    lazycomment,
    lazyrec,
}