const Recipe = require("../models/recipe.js");
const Suggestion = require("../models/suggestion.js");
const Tag = require("../models/tag.js");
const User = require("../models/users.js");
const mongoose = require('mongoose');
const Post = require("../models/post.js");
const conn = mongoose.connection;

const loadProfile = async (req,res) => {
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

    const session = await conn.startSession();
    try {
        session.startTransaction();                    
        
        await User.findOneAndUpdate({uuid:uuid},{username:req.body.username},{ session });
        
        await Post.updateMany({userUuid:uuid},{username:req.body.username},{ session });

        await Recipe.updateMany({userUuid:uuid},{username:req.body.username},{ session });

        await session.commitTransaction();
        
        console.log('success');

        res.status(201).json({
            status: true,
            message: "Successfully updated",
            errors: [],
            data: {},
          });
    } catch (error) {
        console.log('error');

        await session.abortTransaction();

        res.status(201).json({
            status: false,
            message: "Update failed",
            errors: [],
            data: {},
          });
    }
    session.endSession();
}

module.exports = {
    loadProfile,
    loadBookmark,
    currentProfile,
    updateProfile,
    updateUsername
}