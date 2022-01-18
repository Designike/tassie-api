const path = require("path");
const multer = require("multer");

// const Profile = require('../models/profileModel');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads/" + req.user.uuid);
    },
    filename: function(req, file, cb) {
        let ext = path.extname(file.originalname);
        // console.log(file);
        cb(null, Date.now() + Math.floor(Date.now() * Math.random()).toString() + ext);
    }
})

var upload = (req, res, next) => {
    
    const uploadFile = multer({
            storage: storage,
            fileFilter: function(req, file, callback) {
                // console.log(file);
                if(
                    file.mimetype == "image/png" ||
                    file.mimetype == "image/jpg" ||
                    file.mimetype == "image/jpeg" ||
                    file.mimetype == "application/octet-stream"
                ){
                    callback(null, true)
                } else {
                    console.log("only png and jpg");
                    return callback(null, false)
                }
            },
            limits: {
                fileSize: 1024 * 1024 * 5
            }
        }).single('media');

    uploadFile(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // Profile.find({}).then(found => {
            //     if(found.length > 0){
            //         res.render('profile', {alert: "File not supported or error uploading file", profile: found[0]});
            //     } else {
            //         res.render('profile', {alert: "File not supported or error uploading file", profile: {}});
            //     }
            // }).catch(err => {
            //     res.render('err', {error: err});
            // })
            res.status(201).json({
                status: false,
                message: "File type not supported or large file",
                errors: [],
                data: {},
              });
            
        } else if (err) {
            res.status(201).json({
                status: false,
                message: "Error uploading image",
                errors: [],
                data: {},
              });
        } else {
            next();
        }
        // Everything went fine. 
        
    })
}


module.exports = upload;