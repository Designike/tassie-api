const User = require("../models/users.js");
const Post = require("../models/post.js");
const Subscribed = require("../models/subscribed.js");
const { drivePostUpload, generatePublicUrl } = require("../controllers/driveController.js");
const { v4: uuidv4 } = require("uuid");
const e = require("express");

const load = async (req,res) => {

    let post = [];
    let nameList = [];
    uuid = req.user.uuid;
    const found = await Subscribed.findOne({user:uuid})
    if(found){
        await found.subscribed.forEach(async (element) => {
            const find = await Post.find({userUuid:element});
            // console.log(find);
            post.push(find);
            let name = await User.findOne({uuid:element});
            nameList.push(name.name);
            // console.log(name.name);

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

const loadfeed = (req, res) => {
    // console.log(res.paginatedResults);
    res.status(201).json({
        status: true,
        message: "",
        errors: [],
        data: {posts: res.paginatedResults},
      });
}

const loadcomment = (req, res) => {
    res.status(201).json({
        status: true,
        message: "",
        errors: [],
        data: {comments: res.paginatedComments},
      });
}
// const lazyload = async (req,res,next) => {
//     const page = parseInt(req.params.page);
//     const limit = 4;
//     const startIndex = (page - 1)*limit;
//     const endIndex = page*limit;
//     const results = {}

//     uuid = req.user.uuid;
//     const found = await Subscribed.findOne({user:uuid},'-user subscribed -subscriber')
//     console.log(await Post.find({uuid:{$in: found}}).toArray());
//     if (endIndex < await Post.find({uuid:{$in: found}}).countDocuments().exec()) {
//         results.next = {
//           page: page + 1,
//           limit: limit
//         }
//       }

//       if (startIndex > 0) {
//         results.previous = {
//           page: page - 1,
//           limit: limit
//         }
//       }

//       try {
//         results.results = await Post.find().limit(limit).skip(startIndex).exec()
//         res.paginatedResults = results
//         next()
//       } catch (e) {
//         res.status(500).json({ message: e.message })
//       }
    
// }

const createPost = async (req, res) =>{

    const userUuid = req.user.uuid;
    const postID = await drivePostUpload(userUuid, req.file, req.user.postFolder);
    console.log(postID);
    if(postID.status == true) {
        console.log('1a');
        const postURL = await generatePublicUrl(postID.response.id);
        console.log(postURL);
        if(postURL.status == true) {
            const post = new Post({
                username:req.user.username,
                profilePic:req.user.profilePic,
                userUuid:req.user.uuid,
                description:req.body.desc,
                url:postURL.response.webContentLink,
                likes:[],
                comments:[],
                uuid:postID.filename,
                postID: postID.response.id
            });
            console.log('2a');
            console.log(post);
            post.save((err)=>{
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
                        errors: [],
                        data: {},
                      });
                }
            });
        } else {
            res.status(201).json({
                status: false,
                message: "Error while saving",
                errors: [],
                data: {},
              });
        }
        
    } else {
        res.status(201).json({
            status: false,
            message: "Error while saving",
            errors: [],
            data: {},
          });
    }
    
}

const addLike = async (req,res) => {
    try{
    userUuid = req.user.uuid;
    postUuid = req.body.uuid;
    const post = Post.findOne({uuid:postUuid});
    post.likes.push(userUuid);
    post.save();
    res.status(201).json({
        status: true,
        message: "Liked",
        errors: [],
        data: {},
      });
    }catch(err){
        res.status(201).json({
            status: false,
            message: "error liking it",
            errors: [],
            data: {},
          });
    }

}


module.exports = {
    load,
    trialLoad: loadfeed,
    loadcomment,
    createPost,
    addLike,
};