const User = require("../models/users.js");
const Post = require("../models/post.js");
const Subscribed = require("../models/subscribed.js");

const load = async (req,res) => {

    let post = [];
    let nameList = [];
    uuid = req.user.uuid;
    const found = await Subscribed.findOne({user:uuid})
    if(found){
        await found.subscribed.forEach(async (element) => {
            const find = await Post.find({userUuid:element});
            post.push(find);
            let name = await User.findOne({uuid:element});
            nameList.push(name);

            if(found.subscribed.length > 0 && found.subscribed.indexOf(element) == found.subscribed.length - 1) {
                res.status(201).json({
                    status: true,
                    message: "",
                    errors: [],
                    data: {post:post,nameList:nameList},
                  });
            } else if (found.subscribed.length == 0) {
                res.status(201).json({
                    status: true,
                    message: "No results found",
                    errors: [],
                    data: {post:post,nameList:nameList},
                  });
            }
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