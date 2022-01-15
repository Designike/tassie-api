const User = require("../models/users.js");
const Post = require("../models/post.js");
const Subscribed = require("../models/subscribed.js");

const lazyfeed = async (req,res,next) => {
    const page = parseInt(req.params.page);
    // console.log(page);
    const limit = 1;
    const startIndex = (page - 1)*limit;
    // console.log(startIndex);
    const endIndex = page*limit;
    const results = {}

    uuid = req.user.uuid;
    const found = await Subscribed.findOne({user:uuid},'-_id subscribed')
    // console.log(await Post.find({userUuid:{$in: found.subscribed}}).countDocuments().exec());
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
        results.results = await Post.find({userUuid:{$in: found.subscribed}}).sort('-createdAt').limit(limit).skip(startIndex).exec();
        res.paginatedResults = results
        next()
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

module.exports = {
    lazyfeed
}