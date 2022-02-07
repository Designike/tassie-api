const Recipe = require("../models/recipe.js");
const Suggestion = require("../models/suggestion.js");
const Tag = require("../models/tag.js");
const User = require("../models/users.js");

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

module.exports = {
    loadProfile,
    loadBookmark,
    currentProfile,
    updateProfile
}