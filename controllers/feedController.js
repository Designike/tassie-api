const User = require("../models/users.js");
const Post = require("../models/post.js");
const Subscribed = require("../models/subscribed.js");

const load = (req,res) => {

    let post = [];
    uuid = req.user.uuid;
    const found = Subscribed.findOne({user:uuid})
    if(found){
        found.subscribed.forEach(element => {
            const find = Post.find({userUuid:element});
            post.push(find);
        });
        res.status(201).json({
            status: true,
            message: "",
            errors: [],
            data: post,
          });
    }
    else{
        res.status(201).json({
            status: false,
            message: "Follow someone!",
            errors: [],
            data: {},
          });
    }

}


module.exports = {
    load,
};