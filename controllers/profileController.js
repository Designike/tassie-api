const Recipe = require("../models/recipe.js");
const Suggestion = require("../models/suggestion.js");
const Tag = require("../models/tag.js");
const User = require("../models/users.js");
const mongoose = require('mongoose');
const Post = require("../models/post.js");
const Subscribed = require("../models/subscribed.js");
const conn = mongoose.connection;

const loadProfile = async (req,res) => {
    // console.log(res.paginatedResults);
    // console.log(res);
    res.status(201).json({
        status: true,
        message: "",
        errors: [],
        data: res.paginatedResults,
      });
}

const loadBookmark = async (req,res) => {
    res.status(201).json({
        status: true,
        message: "",
        errors: [],
        data: res.paginatedResults,
      });
}

const currentProfile = async (req,res) => {
    const uuid = req.user.uuid;
    try{
        const user = await User.findOne({uuid:uuid},'-_id uuid name bio website gender number');
        res.status(201).json({
            status: true,
            message: "",
            errors: [],
            data: {user:user},
          });
    }catch(e){
        res.status(201).json({
            status: false,
            message: "Failed to retrive user",
            errors: e,
            data: {},
          });
    }

}

const updateProfile = async (req,res) => {
    const uuid = req.user.uuid;
    console.log(req.body);
    try {
        await User.findOneAndUpdate({uuid:uuid},{name:req.body.name, website:req.body.website, bio:req.body.bio, number:req.body.number, gender:req.body.gender});
        res.status(201).json({
            status: true,
            message: "Successfully updated",
            errors: [],
            data: {},
          });
    } catch (error) {
        res.status(201).json({
            status: false,
            message: "Update failed",
            errors: [],
            data: {},
          });
    }
}

const updateUsername = async (req,res) => {
    const uuid = req.user.uuid;
    const oldUsername = req.user.username;
    console.log(req.body);
    const session = await conn.startSession();
    try {

        res.status(201).json({
            status: true,
            message: "Successfully updated",
            errors: [],
            data: {},
          });

        session.startTransaction();                    
        
        await User.findOneAndUpdate({uuid:uuid},{username:req.body.username},{ session });

        await Post.updateMany({userUuid:uuid},{username:req.body.username},{ session });

        await Post.updateMany({'comments.username':oldUsername},{"$set":{'comments.$[].username':req.body.username}},{ session });

        await Recipe.updateMany({userUuid:uuid},{username:req.body.username},{ session });
        
        await Recipe.updateMany({'comments.username':oldUsername},{"$set":{'comments.$[].username':req.body.username}},{ session });

        await session.commitTransaction();
        
        console.log('success');

        
    } catch (error) {
        console.log('error');

        await session.abortTransaction();

        // res.status(201).json({
        //     status: false,
        //     message: "Update failed",
        //     errors: [],
        //     data: {},
        //   });
    }
    session.endSession();
}

const getProfile = async (req, res) => {
    // const results = {};
    // let isMyProfile = req.params.isMyProfile;
    let uuid;
    if(req.params.uuid == "user") {
        uuid = req.user.uuid;
    }else{
        uuid = req.params.uuid;
    }
    const noOfPosts = await Post.find({userUuid:uuid}).countDocuments().exec(); 
    const noOfRecipes = await Recipe.find({userUuid:uuid}).countDocuments().exec();
    let noOfSub = await Subscribed.aggregate([{$match: {user: uuid}},{$project: {subscriber: { $size:"$subscriber" }, subscribed: { $size:"$subscribed" }, isSubscribed : { "$in" : [ req.user.uuid, "$subscriber" ]}}}]);
    const userData = await User.findOne({uuid:uuid},'-_id bio website name username uuid profilePic');
    console.log(userData);
    res.status(201).json({
        status: true,
        message: "User data",
        errors: [],
        data: {noOfPosts: noOfPosts, noOfRecipes: noOfRecipes,noOfSub: noOfSub[0],userData:userData},
      });
}


const subscribe = async (req,res) => {
    try {
    const uuid = req.body.uuid;
    const userUuid = req.user.uuid;
    //account vado manas
    let sub1 = await Subscribed.findOne({user:uuid});
    //je follow dabave che e
    let sub2 = await Subscribed.findOne({user:userUuid});
    //account vada manas na subscriber ma jase
    sub1.subscriber.push(userUuid);
    //krva vada na subscribed ma jase
    sub2.subscribed.push(uuid);
    await sub1.save();
    await sub2.save();
    res.status(201).json({
        status: true,
        message: "Subscribed",
        errors: [],
        data: {},
      });
    } catch (error) {
        console.log(error);
        res.status(201).json({
            status: false,
            message: "Not Subscribed",
            errors: [error],
            data: {},
          });
    }
}

const unsubscribe = async (req,res) => {
    try {
        
    const uuid = req.body.uuid;
    const userUuid = req.user.uuid;
    //account vado manas
    let sub1 = await Subscribed.findOne({user:uuid});
    //je follow dabave che e
    let sub2 = await Subscribed.findOne({user:userUuid});
    //account vada manas na subscriber ma jase
    sub1.subscriber.pop(userUuid);
    //krva vada na subscribed ma jase
    sub2.subscribed.pop(uuid);
    await sub1.save();
    await sub2.save();
    res.status(201).json({
        status: true,
        message: "Unsubscribed",
        errors: [],
        data: {},
      });
    } catch (error) {
        console.log(error);
        res.status(201).json({
            status: false,
            message: "Not Unsubscribed",
            errors: [error],
            data: {},
          });
    }
}

const postStats = async (req, res) => {
    try{
    let postUuid = req.body.postUuid;
    
    let beta = await Post.aggregate([{$match: {uuid: postUuid}},{$project: {comments: { $size:"$comments" }, likes: { $size:"$likes" },"isLiked" : { "$in" : [ req.user.uuid, "$likes" ]}, "isBookmarked" : { "$in" : [ req.user.uuid, "$bookmarks" ]}, username: true, createdAt: true, description: true}}]).exec();
    console.log(beta[0]);
    res.status(201).json({
        status: true,
        message: "Post Stats",
        errors: [],
        data: beta[0],
        });
    
    } catch (error) {
        console.log(error);
        res.status(201).json({
            status: false,
            message: "Post not found",
            errors: [error],
            data: {},
        });
        }
}

const getPost = async (req, res) => {
    try {
        let postUuid = req.params.uuid;
        let userUuid = req.user.uuid;
        let post = await Post.findOne({uuid:postUuid, userUuid:userUuid},'-_id uuid userUuid description profilePic postID');
        res.status(201).json({
            status:true,
            message: "Post found",
            errors: [],
            data: post
        });
        
    } catch (error) {
        res.status(201).json({
            status:false,
            message: "Post not found",
            errors: [],
            data: {}
        });
    }

}


module.exports = {
    loadProfile,
    loadBookmark,
    currentProfile,
    updateProfile,
    updateUsername,
    getProfile,
    subscribe,
    unsubscribe,
    postStats,
    getPost
}