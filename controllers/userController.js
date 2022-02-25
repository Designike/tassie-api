const User = require("../models/users.js");
const { totp } = require("otplib");
const { v4: uuidv4 } = require("uuid");
const NodeCache = require("node-cache");
const myCache = new NodeCache();
const sgMail = require("@sendgrid/mail");
const {createFolder} = require('./driveController');
const TassieCustomError = require('../errors/tassieCustomError');
const Bookmark = require("../models/bookmarks.js");
const Subscribed = require("../models/subscribed.js");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

totp.options = {
  digits: 6,
  step: 1000,
};
const opts = totp.options;
const secret = process.env.TOTP_SECRET;

const register = async (req, res) => {
  let user = req.body;
  const uuid = uuidv4() + "_" + req.body.username;
  let options = [
    'assets/Avacado.png',
    'assets/Banana.png',
    'assets/Pineapple.png',
    'assets/Pumpkin.png',
    'assets/Shushi.png'
  ];

  user.uuid = uuid;
  user.profilePic = options[Math.floor(Math.random()*options.length)];
  user.gender = "";
  user.number = "";
  user.website = "";
  user.bio = "";
  try {
    const userToRegister = uuid;
    myCache.set(userToRegister, user);
    // res.redirect("user/mail/" + uuid);
    await mail(req, res, uuid);
  } catch (error) {
    res.status(400).json({
      status: false,
      message: "User can't be created",
      errors: [],
      data: {},
    });
  }
};

const login = async (req, res) => {
  let user;
  try {
    if(req.body.email){  
    user = await User.findByCredentials(
      req.body.email,
      "",
      req.body.password
    );
  }else if(req.body.username){
    user = await User.findByCredentials(
      "",
      req.body.username,
      req.body.password
    );
  }else{
    throw new Error('Incomplete parameters');
  }
    const token = await user.generateAuthToken();
    // res.status(200).send({ user, token });
    res.status(200).json({
        status: true,
        message: "You are logged in !",
        errors:[],
        data: {
            uuid:user.uuid,
            profilePic: user.profilePic,
            token:token
        }
    })
  } catch (error) {
    if(error instanceof TassieCustomError) {
      res.status(200).json({
        status: false,
        message: error.message,
        errors: [error],
        data: {}
    })
    } else {
    // res.status(400).send(error);
    res.status(200).json({
        status: false,
        message: "Unable to access your account",
        errors:[error],
        data: {}
    })
  }
  }
};

const logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    // res.send();
    res.status(200).json({
        status: true,
        message: "You have been logout",
        errors:[],
        data: {}
    })
  } catch (error) {
    // res.status(500).send();
    console.log(error);
    res.status(200).json({
        status: false,
        message: "Unable to logout",
        errors:error,
        data: {}
    })
  }
};

const logoutAll = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    // res.send();
    res.status(200).json({
        status: true,
        message: "You have been logout from all of your accounts !!!",
        errors:[],
        data: {}
    })
  } catch (error) {
    // res.status(500).send();
    res.status(500).json({
        status: false,
        message: "Unable to logout from all of your accounts ",
        errors:error,
        data: {}
    })
  }
};

const findAll = async (req, res) => {
//   res.send(req.user);

  try{
      const user=await User.find({})
    //   res.status(201).send(user)
      res.status(201).json({
        status: true,
        message: "This is your profile",
        errors:[],
        data: {
            users:user
        }
       })
    }catch(error){
    //   res.status(400).send(error)
    res.status(400).json({
        status: false,
        message: "Unable to read all the users",
        errors:error,
        data: {}
    })
  }

//   User.find({}).then((users)=>{
//       res.status(200).send(users)
//   }).catch((error)=>{
//       res.status(500).send(error)
//   })
};

const findOne = async (req, res) => {
  const uuid = req.params.id;

  try {
    const user = await User.findOne({uuid: uuid});
    if (!user) {
    //   return res.status(404).send();
      return res.status(404).json({
        status: false,
        message: "No User has been found",
        errors:error,
        data: {}
       })
    }
    // res.status(200).send(user);
    res.status(200).json({
        status: true,
        message: "This is your profile",
        errors:[],
        data: {
            users:user
        }
       })
  } catch (error) {
    // res.status(500).send(error);
    res.status(500).json({
        status: false,
        message: "Unable to read any User !!!",
        errors:error,
        data: {}
    })
  }

  // User.findById(_id).then((user)=>{
  //     if(!user){
  //         return res.status(404).send()
  //     }
  //     res.status(200).send(user)
  // }).catch((error)=>{
  //     res.status(500).send(error)
  // })
};

const update = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name","number","website","bio", "username"];
  const isValidOpration = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOpration) {
    return res.status(400).send("Invalid updates!");
  }

  try {
    const user = await User.findById(req.params.id);

    updates.forEach((update) => (user[update] = req.body[update]));

    await user.save();

    // const user=await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
    if (!user) {
    //   res.status(404).send();
      res.status(404).json({
        status: false,
        message: "No User found !!!",
        errors:error,
        data: {}
    })
    }
    // res.status(200).send(user);
    res.status(200).json({
        status: true,
        message: "Your profile has been updated",
        errors:[],
        data: {
            user:user
        }
    })
  } catch (error) {
    // res.status(500).send(error);
    res.status(500).json({
        status: false,
        message: "Unable to update your account profile !!!",
        errors:error,
        data: {}
    })
  }
};

const remove = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      // res.status(404).send('No user found')
      res.status(404).json({
        status: false,
        message: "No User Found",
        errors: error,
        data: {},
      });
    }
    // res.status(200).send('Deleted!')
    res.status(200).json({
      status: true,
      message: "User has been deleted",
      errors: [],
      data: {},
    });
  } catch (error) {
    // res.status(500).send(error)
    res.status(500).json({
      status: false,
      message: "Unable to delete User",
      errors: error,
      data: {},
    });
  }
};

const updatePassword = async (req,res) => {
  oldpass = req.body.oldpass;
  newpass = req.body.newpass;
  const user = await User.findOne({uuid: req.user.uuid});
  const isMatch= await bcrypt.compare(oldpass,user.password);
  if(!isMatch){
      res.status(400).json({
        status: false,
        message: "Invalid Password!",
        errors: [],
        data: {},
      });
  }
  try {
    await User.updateOne({uuid: req.user.uuid},{password:newpass});
    res.status(201).json({
      status: true,
      message: "Updated successfully!",
      errors: [],
      data: {},
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: "Error in updating password.",
      errors: error,
      data: {},
    });
  }
  
}

const updateEmail = async (req, res) => {
  newEmail = req.body.email;
  myCache.set(req.user.uuid + '_email', newEmail);
  mail(req, res, req.params.uuid);
}
//Twilio otp

const verifyEmail = async (req, res) => {
  const newEmail = myCache.get(req.params.uuid + "_email");
  const isValid = totp.check(req.body.totp, secret);
  if (req.user && isValid == true) {
    try {
      await User.updateOne({uuid: req.user.uuid},{
        email:newEmail
      });
      res.status(201).json({
        status: true,
        message: "Email updated",
        errors: [],
        data: {},
      });
      myCache.take(user.uuid);
    } catch (error) {
      res.status(400).json({
        status: false,
        message: "Error in updating email",
        errors: error,
        data: {},
      });
    }
  } else {
    res.send("unathenticated");
    res.status(400).json({
      status: false,
      message: "Unauthenticated",
      errors: error,
      data: {},
    });
  }
}

const mail = async (req, res, uid) => {
  req.user = myCache.get(uid);
  if (req.user) {
    const toptToken = totp.generate(secret);
    const toUser = req.user.email;
    const uuid = req.user.uuid;

    const msg = {
      to: toUser,
      from: "soham2112@gmail.com",
      subject: "Tassie OTP",
      text: messageGenerate(req.user.name, toptToken),
    };

    await sgMail.send(msg, (err, info) => {
      if (err) {
        console.log("email not sent");
        res.status(200).json({
          status: false,
          message: "Mail not sent",
          errors: err,
          data: {},
        });
      } else {
        // res.send(uuid);
        res.status(200).json({
          status: true,
          message: "OTP has been sent to your mail",
          errors: [],
          data: {
            uuid: uuid,
            time: totp.timeRemaining(),
          },
        });
        console.log("email sent to : " + toUser);
      }
    });
  }
};

const twoStepVerification = async (req, res) => {
  req.user = myCache.get(req.params.uuid);
  const isValid = totp.check(req.body.totp, secret);
  if (req.user && isValid == true) {
    try {
      // console.log('1');
      const user = req.user;
      // const postFolder = await createFolder(req.user.uuid, true);
      // console.log('2');
      // if (postFolder.status == true) {
        // const recipeFolder = await createFolder(req.user.uuid, false);
        // console.log('3');
        // if (recipeFolder.status == true) {
          // user.postFolder = postFolder.response.id;
          // user.recipeFolder = recipeFolder.response.id;
          // console.log('4');
          const newUser = new User(user);
          const newBookmark = new Bookmark({userUuid: user.uuid, recipeUuid: [], postUuid: []})
          const newSubs = new Subscribed({user: user.uuid, subscriber: [], subscribed: []})
          const token = await newUser.generateAuthToken();
          await newBookmark.save();
          await newSubs.save();
          await newUser.save();
          console.log('5');
          
          //    res.status(201).send({newUser,token})
          res.status(201).json({
            status: true,
            message: "User has been saved",
            errors: [],
            data: {
              uuid: user.uuid,
              profilePic: user.profilePic,
              token: token,
            },
          });
          myCache.take(user.uuid);
        // } else {
        //   res.status(500).json({
        //     status: false,
        //     message: "Error registering user",
        //     errors: [],
        //     data: {},
        //   })
        // }
      // } else {
      //   res.status(500).json({
      //     status: false,
      //     message: "Error registering user",
      //     errors: [],
      //     data: {},
      //   })
      // }

    } catch (error) {
      //    res.status(400).send(error)
      console.log(error);
      res.status(201).json({
        status: false,
        message: "Server error",
        errors: [error],
        data: {},
      });
    }
  } else {
    // res.send("unathenticated");
    res.status(201).json({
      status: false,
      message: "Unauthenticated or Incorrect OTP",
      errors: [],
      data: {},
    });
  }
};

const messageGenerate = (name, otp) => {
  const message = `${
    "Hello " +
    name +
    ", \nYour One Time Password (OTP) for Tassie App authentication is : " +
    otp +
    "\nThis OTP is valid for next " +
    totp.timeRemaining() +
    " seconds.\n\nThis OTP is based on time for security purposes.\nKindly resend request if expiration time is very less."
  }`;
  return message;
};

const checkUser = async (req, res) => {
  // console.log('chale');
  const found = await User.findOne({username: req.params.user})
  if(found) {
    // console.log('1');
    res.status(400).json({
      status: false,
      message: "Username already exist.",
      errors: [],
      data: {},
    });
  } else {
    const arr = ["That's a great one!", "Damn, that's a new one!", "Nice choice!", "Here you go!", "Good to go!", "Awesome!"];
    res.status(201).json({
      status: true,
      message: arr[Math.floor(Math.random()*arr.length)],
      errors: [],
      data: {},
    });
  }
}
const checkEmail = async (req, res) => {
  const found = await User.findOne({email: req.params.user})
  if(found) {
    res.status(400).json({
      status: false,
      message: "Email is already in use",
      errors: [],
      data: {},
    });
  } else {
    res.status(201).json({
      status: true,
      message: "",
      errors: [],
      data: {},
    });
  }
}

const sendmail = (req, res) => {
  mail(req, res, req.params.uuid);
}

const googleSignIn = async (req,res) => {

  const user = await User.findOne({email: req.body.email});
  
  if(user) {
    const token = await user.generateAuthToken();
    res.status(200).json({
        status: true,
        message: "You are logged in !",
        errors:[],
        data: {
            uuid:user.uuid,
            token:token
        }
    })
  } else {
    res.status(200).json({
      status: false,
      message: "You are not registered",
      errors:[],
      data: {}
    })
  }

  // try {
  //   await User.create(req.user);
  //   res.status(201).json({
  //     status: true,
  //     message: "",
  //     errors: [],
  //     data: {},
  //   });
  // } catch (error) {
  //   res.status(201).json({
  //     status: true,
  //     message: "",
  //     errors: [],
  //     data: {},
  //   });
  // }
}

const googleRegiter = async (req,res) => {

  let user = req.body;
  const uuid = uuidv4() + "_" + req.body.username;
  user.uuid = uuid;
  try {
    
    // console.log('1');
      // const postFolder = await createFolder(req.user.uuid, true);
      // console.log('2');
      // if (postFolder.status == true) {
        // const recipeFolder = await createFolder(req.user.uuid, false);
        // console.log('3');
        // if (recipeFolder.status == true) {
          // user.postFolder = postFolder.response.id;
          // user.recipeFolder = recipeFolder.response.id;
          // console.log('4');
          const newUser = new User(user);
          const newBookmark = new Bookmark({userUuid: user.uuid, recipeUuid: [], postUuid: []})
          const token = await newUser.generateAuthToken();
          await newBookmark.save();
          await newUser.save();
          // console.log('5');
          
          //    res.status(201).send({newUser,token})
          res.status(201).json({
            status: true,
            message: "User has been saved",
            errors: [],
            data: {
              uuid: user.uuid,
              token: token,
            },
          });
        // } else {
        //   res.status(500).json({
        //     status: false,
        //     message: "Error registering user",
        //     errors: [],
        //     data: {},
        //   })
        // }
      // } else {
      //   res.status(500).json({
      //     status: false,
      //     message: "Error registering user",
      //     errors: [],
      //     data: {},
      //   })
      // }

  } catch (error) {
    res.status(200).json({
      status: false,
      message: "User can't be created",
      errors: [],
      data: {},
    });
  }
}

const getProfilePicture = async (req,res) => { 
  res.status(201).json({
    status: true,
    message: "profile picture",
    errors: [],
    data: {profilePic: req.user.profilePic},
  });
}


module.exports = {
  remove,
  update,
  findAll,
  findOne,
  register,
  update,
  login,
  logout,
  logoutAll,
  sendmail,
  twoStepVerification,
  updatePassword,
  updateEmail,
  verifyEmail,
  checkUser,
  checkEmail,
  googleRegiter,
  googleSignIn,
  getProfilePicture
};
