const User = require("../models/users.js");
const Bookmark = require("../models/bookmarks.js");
const Post = require("../models/post.js");
const Subscribed = require("../models/subscribed.js");
const { uploadPost } = require("../controllers/driveController.js");
const { v4: uuidv4 } = require("uuid");
const e = require("express");
const Tag = require("../models/tag.js");

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
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

const createPost = async (req, res) =>{
    try {
    
    const userUuid = req.user.uuid;
    // const postID = await drivePostUpload(userUuid, req.file, req.user.postFolder);
    const postID = await uploadPost(userUuid, req.file);   
    
    // console.log(postID);
    if(postID.status == true) {
        // console.log('1a');
        // const postURL = await generatePublicUrl(postID.response.id);
        // console.log(postURL);
        // if(postURL.status == true) {
            
            let hashtagString = req.body.desc;
            let hashtag = hashtagString.match(/#\w+/g);
            if(hashtag != null){ 
                hashtag = hashtag.filter(onlyUnique);
            
            let postUuid = postID.filename;
            let index = 0;
            hashtag.forEach(async tag => {
                let tag1 = await Tag.findOne({name: tag});
                if (tag1) {
                    tag1.post.push(postUuid);
                    await tag1.save();
                }else{
                    let tag2 = new Tag({name: tag, post: [postUuid], recipe: []});
                    await tag2.save();
                }
                index++;
            });
        }

            const post = new Post({
                username:req.user.username,
                profilePic:req.user.profilePic,
                userUuid:req.user.uuid,
                description:req.body.desc,
                // url:postURL.response.webContentLink,
                likes:[],
                comments:[],
                bookmarks:[],
                uuid:postID.filename,
                postID: postID.response
            });
            // console.log('2a');
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
                        errors: [err],
                        data: {},
                      });
                }
            });
        // } else {
        //     res.status(201).json({
        //         status: false,
        //         message: "Error while saving",
        //         errors: [],
        //         data: {},
        //       });
        // }
        
    } else {
        res.status(201).json({
            status: false,
            message: "Error while posting1",
            errors: [],
            data: {},
          });
    }
} catch (error) {
    console.log(error);
    res.status(201).json({
        status: false,
        message: "Error while posting2",
        errors: [error],
        data: {},
      });  
}
    
}

const deletePost = async (req,res) => {
    try {
        const postUuid = req.params.uuid;
        const toDelete = await Post.findOne({uuid:postUuid});
        let hashtagString = toDelete.description;
            let hashtag = hashtagString.match(/#\w+/g);
            if(hashtag != null){ 
                hashtag = hashtag.filter(onlyUnique);
            
            // let postUuid = req.body.postUuid;
            let index = 0;
            hashtag.forEach(async tag => {
                let tag1 = await Tag.findOne({name: tag});
                if (tag1) {
                    tag1.post.pop(postUuid);
                    await tag1.save();
                }
                index++;
            });
        }
        const post = await Post.findOneAndDelete({uuid:postUuid});
        if(post) {
            res.status(201).json({
                status: true,
                message: "Deleted successfully",
                errors: [],
                data: {},
                });
        } else {
            res.status(201).json({
                status: false,
                message: "Error while deleting",
                errors: [],
                data: {},
                });
        }
    } catch (error) {
        console.log(error);
        res.status(201).json({
            status: false,
            message: "Error while deleting",
            errors: [error],
            data: {},
            });
    }
}


const editPost = async (req, res) => {
    
    let hashtagString = req.body.desc;
            let hashtag = hashtagString.match(/#\w+/g);
            if(hashtag != null){ 
                hashtag = hashtag.filter(onlyUnique);
            
            let postUuid = req.body.postUuid;
            let index = 0;
            hashtag.forEach(async tag => {
                let tag1 = await Tag.findOne({name: tag});
                if (tag1) {
                    let posts = tag1.post;
                    posts.push(postUuid);
                    posts = posts.filter(onlyUnique);
                    tag1.post = posts;
                    await tag1.save();
                }else{
                    let tag2 = new Tag({name: tag, post: [postUuid], recipe: []});
                    await tag2.save();
                }
                index++;
            });
        }
            let post = await Post.findOne({uuid:req.body.postUuid});
            post.description = req.body.desc;
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
                        errors: [err],
                        data: {},
                      });
                }
            })
}



const addLike = async (req,res) => {
    // console.log('hello');
    try{
    const userUuid = req.user.uuid;
    const postUuid = req.body.uuid;
    // console.log(postUuid);
    const post = await Post.findOne({uuid:postUuid});
    // console.log(post);
    if(!post.likes.includes(userUuid)){
        post.likes.push(userUuid);
    }
    // console.log('hello');
    // console.log(post);
    await post.save();
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
    const postUuid = req.body.uuid;
    const post = await Post.findOne({uuid:postUuid});
    post.likes.pop(userUuid);
    await post.save();
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

const addComment = async (req,res) => {
    try {
        
    
    console.log(req.body);
    const comment = req.body.comment;
    const postUuid = req.body.postUuid;
    const username = req.user.username;
    const commentUuid = req.user.uuid+'_comment_'+uuidv4();
    var post = await Post.findOne({uuid:postUuid});
    if(post != null) {
        post.comments.push({uuid:commentUuid,username:username,comment:comment, profilePic: req.user.profilePic});
    await post.save();
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
    const postUuid = req.body.postUuid;
    const commentUuid = req.body.commentUuid;
    var post = await Post.findOne({uuid:postUuid});
    post.comments = post.comments.filter((a) => {return a.uuid != commentUuid});
    await post.save();
    res.status(201).json({
        status: true,
        message: "Comment added",
        errors: [],
        data: {},
    });
}

const addBookmark = async (req,res) => {
    // console.log('hello');
    try{
    const userUuid = req.user.uuid;
    const postUuid = req.body.uuid;
    // console.log(postUuid);
    const post = await Post.findOne({uuid:postUuid});
    let bookmark = await Bookmark.findOne({userUuid:userUuid});
    if(!bookmark.postUuid.includes(postUuid)){
        bookmark.postUuid.push(postUuid);
    }
    // console.log(post);
    if(!post.bookmarks.includes(userUuid)){
        post.bookmarks.push(userUuid);
    }
    // console.log('hello');
    // console.log(post);
    await post.save();
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
            errors: [err],
            data: {},
          });
    }

}


const removeBookmark = async (req,res) => {
    try{
    const userUuid = req.user.uuid;
    const postUuid = req.body.uuid;
    let bookmark = await Bookmark.findOne({userUuid:userUuid});
    const post = await Post.findOne({uuid:postUuid});
    post.bookmarks.pop(userUuid);
    bookmark.postUuid.pop(postUuid);
    await post.save();
    await bookmark.save();
    res.status(201).json({
        status: true,
        message: "Unmarked",
        errors: [],
        data: {},
        });
    }catch(err){
        res.status(201).json({
            status: false,
            message: "error unmarking it",
            errors: [err],
            data: {},
            });
    }
}

// const addHashtag = async (req,res) => {
//     let hashtagString = req.body.hashtag;
//     let hashtag = hashtagString.match(/#\w+/g);
//     let postUuid = req.body.postUuid;
//     let index = 0;
//     hashtag.forEach(async tag => {
//         let tag1 = await Tag.findOne({name: tag});
//         if (tag1) {
//             tag1.post.push(postUuid);
//             await tag1.save();
//         }else{
//             tag1 = await Tag.create({name: tag, postUuid: [postUuid]});
//             await tag1.save();
//         }
//         index++;
//         if(index == hashtag.length - 1){
//             res.status(201).json({
//                 status: true,
//                 message: "tagged",
//                 errors: [],
//                 data: {},
//               });
//         }
//     });
// }

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
    load,
    trialLoad: loadfeed,
    loadcomment,
    createPost,
    editPost,
    deletePost,
    addLike,
    removeLike,
    addComment,
    removeComment,
    addBookmark,
    removeBookmark,
    // addHashtag,
    getHashtag,
};